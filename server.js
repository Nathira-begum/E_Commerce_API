// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const app = express();

// Passport setup (Important!)
require("./passport-setup");

const { SERVER_URL, CLIENT_URL, MONGO_URI } = process.env;

// Connect MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Middlewares
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: 'your_secret',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// 🔥 Google Authentication Routes

// Start Google Auth
// 1️⃣ Start Google Authentication
app.get('/api/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 2️⃣ Handle Google Callback (AFTER user signs in at Google)
app.get('/api/auth/google/callback', 
  passport.authenticate('google', { 
    successRedirect: '/api/auth/google/success', 
    failureRedirect: '/login/failed' 
  })
);

// 3️⃣ After successful login, send user data to frontend
app.get('/api/auth/google/success', (req, res) => {
  if (req.user) {
    const frontendUrl = "http://localhost:5173";
    res.redirect(`${frontendUrl}?user=${encodeURIComponent(JSON.stringify(req.user))}`);
  } else {
    res.redirect("/login/failed");
  }
});


// 🔥 Facebook Authentication Routes

// Start Facebook Auth
app.get('/api/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Facebook Callback
app.get('/api/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    const { firstName, lastName, email, phone } = req.user;
    res.redirect(`${CLIENT_URL}/oauth-success?firstName=${firstName}&lastName=${lastName}&email=${email}&phone=${phone}`);
  }
);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${SERVER_URL}`);
});
