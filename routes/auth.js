const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");


// Utility: Find user by email or name (case-insensitive)
const findUserByIdentifier = async (identifier) => {
  return await User.findOne({
    $or: [
      { email: new RegExp("^" + identifier + "$", "i") },
      { name: new RegExp("^" + identifier + "$", "i") },
    ],
  });
};


// ✅ Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
        dob: user.dob || null,
        gender: user.gender || "",
        roles: user.roles || [],
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Signup
router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("phone")
      .notEmpty().withMessage("Phone number is required")
      .isMobilePhone().withMessage("Invalid phone number"),
    body("password")
      .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  async (req, res) => {
    console.log("Signup request body:", req.body); // 🐞 DEBUG

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, phone, password, dob, gender } = req.body;

    // ✂️ Split name into first and last name (best-effort)
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }

      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ success: false, message: "Phone number already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        firstName,
        lastName,
        email,
        phone,
        dob: dob || null,
        gender: gender || "",
        password: hashedPassword,
        emailVerified: false,
      });

      const savedUser = await newUser.save();

      const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return res.status(201).json({
        success: true,
        message: "Signup successful",
        token,
        user: {
          _id: savedUser._id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          phone: savedUser.phone,
          dob: savedUser.dob,
          gender: savedUser.gender,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);
// ✅ Verify Email
router.get("/verify-email/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.emailVerified = true;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email successfully verified!" });
  } catch (error) {
    console.error("Verify email error:", error);
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired token" });
  }
});

// ✅ Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.name},</p>
        <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Reset Password
router.post("/reset-password/:token", async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(
      decoded.id,
      { password: hashedPassword },
      { runValidators: false }
    );

    return res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired token" });
  }
});

// ✅ Get User by ID
router.get("/api/get-user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Fetch user error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Update Profile
router.post("/update-profile", async (req, res) => {
  const { userId, firstName, lastName, email, phone, gender, dob } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    const updatedFields = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      gender: gender,
      dob: dob ? new Date(dob) : user.dob,
    };
    
    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, { new: true });
    
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
