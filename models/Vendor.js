const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  profilePic: String,
  isApproved: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Vendor', vendorSchema);
