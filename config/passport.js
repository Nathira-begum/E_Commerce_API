import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from 'passport-facebook';
import dotenv from "dotenv";
dotenv.config(); 

import User from "../models/User.js";

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await User.findOne({ providerId: profile.id });

    if (existingUser) return done(null, existingUser);

    const newUser = await User.create({
      provider: 'google',
      providerId: profile.id,
      name: profile.displayName,
      email: profile.emails?.[0]?.value,
      avatar: profile.photos?.[0]?.value,
    });

    done(null, newUser);
  } catch (err) {
    done(err, null);
  }
}));


// To keep sessions working
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'emails', 'name', 'displayName', 'picture.type(large)'],
    enableProof: true
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const existingUser = await User.findOne({ providerId: profile.id });
  
      if (existingUser) return done(null, existingUser);
  
      const newUser = await User.create({
        provider: 'facebook',
        providerId: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        avatar: profile.photos?.[0]?.value ?? profile._json.picture?.data?.url, // 👈 fallback added
      });
  
      done(null, newUser);
    } catch (err) {
      done(err, null);
    }
  }));
  