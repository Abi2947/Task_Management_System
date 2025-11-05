// Auth controllers
// Handles business logic for user signup and login
const { validationResult } = require("express-validator"); // For checking validation errors
const User = require("../models/User");
const jwt = require("jsonwebtoken"); // For generating auth tokens

// Signup controller
// Validates, checks for existing user, creates user, generates JWT
const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() }); // Return validation errors

  try {
    const { username, email, password } = req.body;
    let user = await User.findOne({ email }); // Check if user exists
    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ username, email, password }); // Create new user (password hashed in pre-save)
    await user.save();

    // Generate JWT token for authentication (expires in 1 hour)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(201).json({ token }); // Return token on success
  } catch (err) {
    res.status(500).json({ message: "Server error" }); // Generic error handling
  }
};

// Login controller
// Validates, checks credentials, generates JWT
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }); // Find user by email
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password); // Compare hashed passwords
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, user: { username: user.username } }); // Return token
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signup, login };
