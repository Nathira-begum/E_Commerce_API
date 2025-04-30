require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit"); // Adding rate limiting
const connectDB = require("./config/db");
const User = require("./models/user");
const auth = require("./routes/auth");
const authRoutes = require("./routes/authRoutes");
require("./passport-setup");
const vendorRoutes = require('./routes/vendorRoutes');
const productRoutes = require('./routes/productRoutes');
const path = require('path');
const fs = require("fs");
const app = express();

// ------------------ 🔗 Connect to MongoDB ------------------
connectDB();

// ------------------ 🔧 Middleware Setup ------------------
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// ------------------ 🔐 Session & Passport ------------------
app.use(session({
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// ------------------ 📦 Auth API Routes ------------------
app.use("/api", auth);
app.use('/api/vendor', vendorRoutes);
app.use('/api/products', productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", require("./routes/admin"));

// ------------------ 🔐 Google OAuth ------------------
app.get("/api/auth/google", (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })(req, res, next);
});

app.get("/api/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
    successRedirect: "http://localhost:5173/myaccount",
  })
);

// ------------------ 🔐 Facebook OAuth ------------------
app.get("/api/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

app.get("/api/auth/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "http://localhost:5173/login",
    successRedirect: "http://localhost:5173/myaccount",
  })
);

// ------------------ 🔑 Forgot Password ------------------

// Adding rate limiting for forgot password route
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
  message: "Too many requests, please try again later.",
});

app.post("/api/auth/forgot-password", forgotPasswordLimiter, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No user found with that email." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const resetURL = `http://localhost:5173/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail", // Use Gmail's OAuth2 or better SMTP service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Password Reset" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="${resetURL}">here</a> to reset your password.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Reset email sent successfully." });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to send reset email." });
  }
});

// ------------------ ✅ Validate Reset Token ------------------
app.get("/api/auth/validate-reset-token/:token", (req, res) => {
  const { token } = req.params;
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ success: true, message: "Valid token." });
  } catch (error) {
    const isExpired = error.name === "TokenExpiredError" || error.message.includes("expired");
    res.status(400).json({
      success: false,
      message: isExpired
        ? "Reset token has expired. Please request a new one."
        : "Invalid reset token.",
    });
  }
});

// ------------------ 🔒 Reset Password ------------------
app.post("/api/auth/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ success: true, message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    const isExpired = error.name === "TokenExpiredError" || error.message.includes("expired");
    res.status(400).json({
      success: false,
      message: isExpired
        ? "Reset token has expired. Please request a new one."
        : "Invalid or expired reset token.",
    });
  }
});

// ------------------ 🌐 Theme Management ------------------
app.post("/api/auth/theme", async (req, res) => {
  const { theme } = req.body;

  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const validThemes = ["light", "dark"];
    if (!validThemes.includes(theme)) {
      return res.status(400).json({ success: false, message: "Invalid theme." });
    }

    user.theme = theme;
    await user.save();

    res.json({ success: true, message: `Theme updated to ${theme}`, theme });
  } catch (error) {
    console.error("Theme update error:", error);
    res.status(500).json({ success: false, message: "Failed to update theme" });
  }
});


// Mount product routes
app.use('/api/products', productRoutes);

// ------------------ 🌐 Root Health Check ------------------
app.get("/", (req, res) => {
  res.send("🚀 API Running...");
});

// ------------------ 🚀 Start Server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
