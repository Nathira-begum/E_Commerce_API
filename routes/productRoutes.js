const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require("fs");
const Product = require('../models/Product');
const { v4:uuidv4 } = require('uuid');

// DELETE product by ID
router.delete('/:id', async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting product' });
    }
  });
  
  // GET single product by ID
  router.get('/:id', async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: 'Error getting product' });
    }
  });
  
// Get All Products
router.get('/', async (req, res) => {
    try {
      const products = await Product.find({});
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching products' });
    }
  });
  
  //upload dir
  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  
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
        vendorEmail,
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
        vendorEmail,
      });
  
      await product.save();
      res.status(201).json({ message: "Product added successfully", product });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
module.exports = router;
