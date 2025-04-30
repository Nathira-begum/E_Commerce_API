const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  shopName: String,
  address: String,
  status: { type: String, default: "pending" }, // "approved" or "pending"
});

module.exports = mongoose.model("Vendor", vendorSchema);
