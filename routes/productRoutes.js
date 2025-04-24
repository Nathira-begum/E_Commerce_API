const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { v4: uuidv4 } = require('uuid');

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
  

// Add new product
router.post('/add', async (req, res) => {
  try {
    const { productId, name, image, price, description, colors, sizes, discount, stock, vendorEmail } = req.body;

    const newProduct = new Product({
      productId: productId || uuidv4(),
      name,
      image,
      price,
      description,
      colors,
      sizes,
      discount,
      stock,
      vendorEmail
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while adding product' });
  }
});

module.exports = router;
