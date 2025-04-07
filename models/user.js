const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: {
    type: [String],
    enum: ['user', 'admin', 'vendor', 'superadmin'],
    default: ['user'],
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Wishlist' }],
  orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
});

module.exports = mongoose.model('User', userSchema);
