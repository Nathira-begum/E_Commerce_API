// passport-setup.js
require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const bcrypt = require("bcryptjs");
const User = require("./models/user");

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  SERVER_URL,
} = process.env;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password");
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ✅ Correct Google Strategy
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `${SERVER_URL}/api/auth/google/callback`,
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Step 1: Try finding user by googleId
    let user = await User.findOne({ googleId: profile.id });

    // Step 2: If not found, check if user with same email exists
    if (!user) {
      user = await User.findOne({ email: profile.emails?.[0]?.value });

      if (user) {
        // Email already exists -> Link googleId to existing user
        user.googleId = profile.id;
        await user.save();
      } else {
        // No user with email -> create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0]?.value || `noemail@google.com`,
          firstName: profile.name?.givenName || "Google",
          lastName: profile.name?.familyName || "User",
          phone: "0000000000",
          password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
        });
      }
    }

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));


// ✅ Correct Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: FACEBOOK_CLIENT_ID,
  clientSecret: FACEBOOK_CLIENT_SECRET,
  callbackURL: `${SERVER_URL}/api/auth/facebook/callback`,
  profileFields: ["id", "emails", "name"],
}, 
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ facebookId: profile.id });

    if (!user) {
      user = await User.create({
        facebookId: profile.id,
        email: profile.emails?.[0]?.value || `noemail@facebook.com`,
        firstName: profile.name?.givenName || "Facebook",
        lastName: profile.name?.familyName || "User",
        phone: "0000000000",
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
      });
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));
