const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [{ type: String }] // replace with Product ref if needed
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
