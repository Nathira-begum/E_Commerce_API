const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  stock: { type: Number, required: true },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  tags: [{ type: String }],
  image: { type: String },
  description: { type: String },
  vendorEmail: { type: String, required: true },
  // approved: { type: Boolean, default: false },

});

module.exports = mongoose.model("Product", productSchema);
