// const app = require('./app');
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// server.js
const express = require('express');

const app = express();
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // 👈 This must match your frontend URL
  credentials: true               // 👈 Only needed if you're using cookies/session auth
}));


app.use(express.json()); // to parse JSON bodies


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("Login request:", req.body);

  if (!email ||  !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  return res.status(200).json({ message: "Login successful" });
});



// ✅ Define the route your frontend expects
app.post('/api/signup', (req, res) => {
  const { email, name, phone, password } = req.body;

  console.log("Signup request:", req.body);

  if (!email || !name || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  return res.status(200).json({ message: "Signup successful" });
});

app.listen(5000, () => {
  console.log('✅ Server running on http://localhost:5000');
});
