const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, trim: true},  
  lastName:  { type: String, trim: true },   
  password: { type: String, required: true },
  phone: {
    type: String,
    unique: true,
    sparse: true,    // only enforce uniqueness on docs where phone != null
    default: null    // default to null instead of requiring a value
  },  gender: { type: String },
  dob: { type: String },
  googleId: { type: String },
  facebookId: { type: String },

  roles: {
    type: [String],
    enum: ["user", "admin", "vendor", "superadmin"],
    default: ["user"],
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Wishlist" }],
  orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
});

module.exports = mongoose.model("User", userSchema);
