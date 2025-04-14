// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");

const app = express();

// DB connection
connectDB();

// Passport config
require("./passport-setup");

// Middleware
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.use("/api", authRoutes);

// Google OAuth
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "http://localhost:5173",
  })
);

// Facebook OAuth
app.get(
  "/api/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

app.get(
  "/api/auth/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login",
    successRedirect: "http://localhost:5173",
  })
);

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("✅ Server running on http://localhost:5000");
});
