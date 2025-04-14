const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// ✅ Login
router.post("/login", async (req, res) => {
  const identifier = req.body.email || req.body.name;
  const password = req.body.password;

  try {
    const user = await User.findOne({
      $or: [
        { email: new RegExp("^" + identifier + "$", "i") },
        { name: new RegExp("^" + identifier + "$", "i") },
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Signup
router.post("/signup", async (req, res) => {
  const { email, name, phone, password, confirmPassword } = req.body;
  console.log("Received data:", req.body);

  if (!email || !name || !phone || !password || !confirmPassword)
    return res.status(400).json({ message: "All fields are required" });

  if (password !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const existingUserPhone = await User.findOne({ phone });
    if (existingUserPhone) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [firstName, ...lastNameParts] = name.trim().split(" ");
    const lastName = lastNameParts.join(" ");

    const newUser = new User({
      email,
      firstName,
      lastName,
      phone,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    res.status(201).json({ message: "Signup successful", user: savedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    console.log("Step 1: Email received:", email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Step 2: No user found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Step 3: User found:", user.email);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    console.log("Step 4: Token generated");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log("Step 5: Transporter configured");

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    console.log("Step 6: Reset link:", resetLink);

    console.log("Step 7: Attempting to send email...");
    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });
    console.log("✅ Email sent successfully");

    res.status(200).json({ message: "Password reset link sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Reset Password
router.post("/reset-password/:token", async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

// Express.js route
router.get("/api/get-user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update profile
router.post("/update-profile", async (req, res) => {
  console.log("Received request to update profile");
  const { userId, firstName, lastName, email, phone, gender, dob } = req.body;
  console.log(req.body, "reqbody<<<<<<<<<<<<");

  if (!userId) {
    return res.status(400).json({ message: "User ID missing" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      firstName,
      lastName,
      email,
      phone,
      gender,
      dob: dob ? new Date(dob) : undefined,
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    console.log("profile updated<<<<<<<<<<<");
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
