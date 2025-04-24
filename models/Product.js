const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  image: String,
  price: Number,
  discount: Number,
  stock: Number,
  size: String,
  color: String,
  description: String,
  vendorEmail: String,
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }
});

module.exports = mongoose.model('Product', productSchema);
