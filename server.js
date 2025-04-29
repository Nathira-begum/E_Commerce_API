require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const app = express();

// Passport setup
require("./passport-setup");

// 👇 Add your user auth routes
const userRoutes = require("./routes/auth"); // make sure this path is correct

// Environment Variables
const { SERVER_URL, CLIENT_URL, MONGO_URI } = process.env;

// Connect MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middlewares
app.use(cors({ origin: CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// Sessions for passport
app.use(session({
  secret: 'your_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true if using HTTPS
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// 🔐 Auth Routes (Google + Facebook)
app.get('/api/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback', 
  passport.authenticate('google', { 
    successRedirect: '/api/auth/google/success', 
    failureRedirect: '/login/failed' 
  })
);

app.get('/api/auth/google/success', (req, res) => {
  if (req.user) {
    const frontendUrl = CLIENT_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}?user=${encodeURIComponent(JSON.stringify(req.user))}`);
  } else {
    res.redirect("/login/failed");
  }
});

app.get('/api/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

app.get('/api/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    const { firstName, lastName, email, phone } = req.user;
    res.redirect(`${CLIENT_URL}/oauth-success?firstName=${firstName}&lastName=${lastName}&email=${email}&phone=${phone}`);
  }
);

// ✅ Your REST API Routes (signup, login, profile, etc.)
app.use("/api", userRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at ${SERVER_URL || `http://localhost:${PORT}`}`);
});
