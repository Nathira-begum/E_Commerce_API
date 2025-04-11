const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile); // You can save the user to DB here
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: "FACEBOOK_APP_ID",
      clientSecret: "FACEBOOK_APP_SECRET",
      callbackURL: "/api/auth/facebook/callback",
      profileFields: ["id", "emails", "name"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);
