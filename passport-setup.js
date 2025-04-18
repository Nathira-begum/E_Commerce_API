require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const bcrypt = require("bcryptjs");
const User = require("./models/user");

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  FACEBOOK_CALLBACK_URL
} = process.env;

// Serialize the user ID into session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize the user from session using ID
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password");
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ✅ Google OAuth Strategy with prompt for account selection
passport.use(new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    prompt: "select_account", // Forces the user to select an account even if they are already signed in
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // If no user found, create a new user
        user = await new User({
          googleId: profile.id,
          email: profile.emails?.[0]?.value || "google_user@nomail.com",
          firstName: profile.name?.givenName || "Google",
          lastName: profile.name?.familyName || "User",
          phone: "0000000000",
          password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Generate random password
        }).save();
      }

      done(null, user);
    } catch (err) {
      console.error("Google OAuth error:", err);
      done(err, null);
    }
  }
));

// ✅ Facebook OAuth Strategy (Optional)
passport.use(new FacebookStrategy(
  {
    clientID: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
    callbackURL: FACEBOOK_CALLBACK_URL,
    profileFields: ["id", "emails", "name"],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ facebookId: profile.id });

      if (!user) {
        user = await new User({
          facebookId: profile.id,
          email: profile.emails?.[0]?.value || "facebook_user@nomail.com",
          firstName: profile.name?.givenName || "Facebook",
          lastName: profile.name?.familyName || "User",
          phone: "0000000000",
          password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // Generate random password
        }).save();
      }

      done(null, user);
    } catch (err) {
      console.error("Facebook OAuth error:", err);
      done(err, null);
    }
  }
));
