const express = require("express");
const Vendor = require("../models/Vendor");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();

// Vendor Register
router.post("/register", async (req, res) => {
  const existing = await Vendor.findOne({ email: req.body.email });
  if (existing) return res.status(400).json({ message: "Email already registered" });

  const hashed = await bcrypt.hash(req.body.password, 10);
  const vendor = new Vendor({ ...req.body, password: hashed });
  await vendor.save();
  res.json({ message: "Vendor registered" });
});

// Vendor Login
router.post("/login", async (req, res) => {
  const vendor = await Vendor.findOne({ email: req.body.email });
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  const match = await bcrypt.compare(req.body.password, vendor.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ email: vendor.email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ token, vendor });
});

module.exports = router;
