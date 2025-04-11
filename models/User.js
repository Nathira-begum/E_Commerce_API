import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['google', 'facebook', 'otp'],
    required: true,
  },
  providerId: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  avatar: String,
  phone: String, // Only for OTP login
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;
