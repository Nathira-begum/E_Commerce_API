import { auth } from '../config/firebase.js';
import User from '../models/User.js'; 
export const verifyOtp = async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const phoneNumber = decodedToken.phone_number;

    console.log("Decoded UID:", uid);
    console.log("Phone number:", phoneNumber);

    // Check if user already exists
    let user = await User.findOne({ providerId: uid });

    if (!user) {
      console.log("User not found, creating a new one...");
      user = await User.create({
        provider: 'otp',
        providerId: uid,
        name: '', // You can collect this later
        email: '', // Not available via OTP usually
        phone: phoneNumber,
        avatar: '', // Optional
      });
      console.log("New user created:", user);
    } else {
      console.log("User already exists:", user);
    }

    res.status(200).json({ message: 'OTP verified successfully', uid, user });
  } catch (error) {
    res.status(400).json({ message: 'Invalid OTP token', error });
  }
};
