const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      productId: String,
      quantity: Number,
      price: Number,
    }
  ],
  totalAmount: Number,
  status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('Order', orderSchema);
