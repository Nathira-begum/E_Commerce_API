const express = require('express');
// server.js
require('dotenv').config();  


const app = express();
const cors = require('cors');

const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("./passport-setup");
app.use(cookieParser());
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true               
}));


app.use(express.json()); // to parse JSON bodies


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("Login request:", req.body);

  if (!email ||  !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  return res.status(200).json({ message: "Login successful" });
});



// ✅ Define the route your frontend expects
app.post('/api/signup', (req, res) => {
  const { email, name, phone, password } = req.body;

  console.log("Signup request:", req.body);

  if (!email || !name || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  return res.status(200).json({ message: "Signup successful" });
});


// Google
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/api/auth/google/callback",
  (req, res, next) => {
    console.log("Callback URL triggered!");
    next();
  },
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "http://localhost:5173",
  })
);


// Facebook
app.get("/api/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

app.get(
  "/api/auth/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login",
    successRedirect: "http://localhost:5173",
  })
);
app.listen(5000, () => {
  console.log('✅ Server running on http://localhost:5000');
});
