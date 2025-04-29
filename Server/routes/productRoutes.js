const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Add new product
router.post("/add-product", async (req, res) => {
  try {
    const {
      name,
      price,
      discount,
      stock,
      sizes,
      colors,
      tags,
      image,
      description,
    } = req.body;

    // Create new product with proper array handling
    const product = new Product({
      name,
      price,
      discount,
      stock,
      sizes,       
      colors,      
      tags,        
      image,
      description,
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
