import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../config/firebase.js'; // Firebase Admin SDK for OTP

// JWT Generator
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      provider: user.provider,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Social login handler (Google / Facebook)
export const handleSocialAuth = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Authentication failed' });

  const token = generateToken(req.user);
  res.status(200).json({ message: 'Login successful', user: req.user, token });
};

// OTP Login handler
export const handleOtpLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const phoneNumber = decodedToken.phone_number;

    let user = await User.findOne({ providerId: uid });

    if (!user) {
      user = await User.create({
        provider: 'otp',
        providerId: uid,
        name: '',
        email: '',
        phone: phoneNumber,
        avatar: '',
      });
    }

    const token = generateToken(user);
    res.status(200).json({ message: 'OTP verified', user, token });
  } catch (err) {
    res.status(400).json({ message: 'OTP verification failed', error: err.message });
  }
};
