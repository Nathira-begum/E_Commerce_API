const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
const router = express.Router();

// ensure uploads folder
const UPLOAD_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/image-search", upload.single("image"), async (req, res) => {
  console.log('File:', req.file); // ✅

  try {
    // Ensure the file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Find all products matching name, tags, or colors
    const raw = req.file.originalname;
    const keywordParts = raw
      .split(".")
      .slice(0, -1)
      .join(".") // remove extension
      .toLowerCase()
      .split(/[^a-z0-9]+/g) // split by non-alphanumeric chars like -, _, space
      .filter(Boolean); // remove empty strings

    console.log("Extracted keywords:", keywordParts);

    const matches = await Product.find({
      $or: [
        { name: { $in: keywordParts.map((k) => new RegExp(k, "i")) } },
        { tags: { $in: keywordParts } },
        { colors: { $in: keywordParts } },
      ],
    });

    // Log matches for debugging
    console.log("Matches found:", matches);

    // Clean up uploaded file (comment out for debugging)
    // fs.unlinkSync(req.file.path);

    // Return the array of matches
    return res.json({ products: matches });
  } catch (err) {
    console.error("Image-search error:", err);
    // Attempt to clean up
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    return res.status(500).json({ message: "Error processing image search" });
  }
});

// GET /api/products?q=...
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

    const prods = await Product.find(filter);
    res.json(prods);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// POST /api/products/add-product
router.post("/add-product", async (req, res) => {
  try {
    const p = new Product(req.body);
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: "Error getting product" });
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting" });
  }
});

module.exports = router;
