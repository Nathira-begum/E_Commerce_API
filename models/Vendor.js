const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  shopName: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, default: "pending" },
  isApproved: { type: Boolean, default: false }
});

module.exports = mongoose.model("Vendor", vendorSchema);
