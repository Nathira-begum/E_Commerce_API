const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const router = express.Router();

// Ensure uploads folder
const UPLOAD_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// POST /api/products/image-search
router.post("/image-search", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const raw = req.file.originalname;
    const keywordParts = raw
      .split(".")
      .slice(0, -1)
      .join(".")
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .filter(Boolean);

    const matches = await Product.find({
      $or: [
        { name: { $in: keywordParts.map((k) => new RegExp(k, "i")) } },
        { tags: { $in: keywordParts } },
        { colors: { $in: keywordParts } },
      ],
    });

    // Clean up uploaded file (uncomment for production)
    // fs.unlinkSync(req.file.path);

    return res.json({ products: matches });
  } catch (err) {
    console.error("Image-search error:", err);
    // Attempt to clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupErr) {
        console.error("Error cleaning up file:", cleanupErr);
      }
    }
    return res.status(500).json({ message: "Error processing image search" });
  }
});

// POST /api/products/add-product
router.post("/add-product", async (req, res) => {
  try {
    const {
      category,
      name,
      price,
      discount = 0,
      stock,
      sizes,
      colors,
      tags,
      image,
      description,
      vendorEmail,
    } = req.body;

    const product = new Product({
      category,
      name,
      price,
      discount: Number(discount) || 0,
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

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};

    if (q) {
      const regex = new RegExp(q, "i");
      filter = {
        $or: [
          { name: regex },
          { tags: { $in: [regex] } },
          { colors: { $in: [regex] } },
        ],
      };
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    console.error("Error getting product:", err);
    res.status(500).json({ message: "Error getting product" });
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Error deleting product" });
  }
});

module.exports = router;
