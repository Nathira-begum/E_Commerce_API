const express = require("express");
const Admin = require("../models/Admin");
const Vendor = require("../models/Vendor");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcrypt");

// Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(404).json({ message: "Admin not found" });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ email: admin.email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.json({ token });
});

// Get pending vendors
router.get("/vendors/pending", async (req, res) => {
  const vendors = await Vendor.find({ status: "pending" });
  res.json(vendors);
});

// Approve vendor
router.post("/vendors/approve/:id", async (req, res) => {
  await Vendor.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.json({ message: "Vendor approved" });
});

// Get pending products
router.get("/products/pending", async (req, res) => {
  const products = await Product.find({ approved: false });
  res.json(products);
});

// Approve product
router.post("/products/approve/:id", async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { approved: true });
  res.json({ message: "Product approved" });
});

module.exports = router;
