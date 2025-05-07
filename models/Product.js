const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  category:{ type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0, min: 0 },
  stock: { type: Number, required: true },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  tags: [{ type: String }],
  image: { type: String },
  description: { type: String },
  vendorEmail: { type: String, required: true },
<<<<<<< HEAD
  
=======
  // approved: { type: Boolean, default: false },
>>>>>>> 97595aa657683373d23ca6b270004a655740b418

});

module.exports = mongoose.model("Product", productSchema);
