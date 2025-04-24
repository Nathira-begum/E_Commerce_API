const express = require('express');
const bcrypt = require('bcrypt');
const Vendor = require('../models/Vendor');
const router = express.Router();


router.get('/:id', async (req, res) => {
    try {
      const vendor = await Vendor.findById(req.params.id);
      res.json(vendor);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching vendor' });
    }
  });
  
// Vendor Signup
router.post('/vendorSignup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) return res.status(400).json({ message: 'Vendor already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newVendor = new Vendor({ username, email, password: hashedPassword });
    await newVendor.save();
    res.status(201).json({ message: 'Vendor registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Vendor Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.status(200).json({ message: 'Login successful', vendor: { username: vendor.username, email: vendor.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
