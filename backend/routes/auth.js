// Authentication routes
// Defines paths and validation, delegates logic to controllers
const express = require("express");
const { body } = require("express-validator"); // For input validation/sanitation
const { signup, login } = require("../controllers/authController");
const router = express.Router();

// Signup route with validation
router.post(
  "/signup",
  [
    body("username").trim().notEmpty().escape(), // Sanitize username
    body("email").isEmail().normalizeEmail(), // Validate and normalize email
    body("password").isLength({ min: 8 }), // Ensure password length
  ],
  signup
);

// Login route with validation
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  login
);

module.exports = router;
