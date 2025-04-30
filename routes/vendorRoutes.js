const express = require("express");
const router = express.Router();
const Vendor = require("../models/vendor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Vendor Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password, shopName, address, status } = req.body;

    if (!name || !email || !phone || !password || !shopName || !address) {
      return res.status(400).json({ msg: "Please fill all required fields" });
    }

    const exists = await Vendor.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Vendor already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendor = new Vendor({
      name,
      email,
      phone,
      password: hashedPassword,
      shopName,
      address,
      status: status || "pending"
    });

    await vendor.save();
    res.status(201).json({ msg: "Vendor created successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Vendor Login (if needed)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: vendor._id }, JWT_SECRET, { expiresIn: "2d" });

    res.json({ token, vendor: { id: vendor._id, name: vendor.name, email: vendor.email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
