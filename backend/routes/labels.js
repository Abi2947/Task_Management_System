// Label CRUD routes
// Defines paths, auth, validation; delegates to controllers
const express = require("express");
const { body } = require("express-validator");
const {
  createLabel,
  getLabels,
  updateLabel,
  deleteLabel,
} = require("../controllers/labelsController");
const auth = require("../middleware/auth");
const router = express.Router();

// Create Label (POST) with validation
router.post(
  "/",
  auth,
  [
    body("name").trim().notEmpty().escape(), // Required name, sanitized
    body("color")
      .optional()
      .matches(/^#[0-9A-F]{6}$/i), // Validate hex color
  ],
  createLabel
);

// Read Labels (GET)
router.get("/", auth, getLabels);

// Update Label (PUT) with validation
router.put(
  "/:id",
  auth,
  [
    body("name").optional().trim().notEmpty().escape(),
    body("color")
      .optional()
      .matches(/^#[0-9A-F]{6}$/i),
  ],
  updateLabel
);

// Delete Label (DELETE)
router.delete("/:id", auth, deleteLabel);

module.exports = router;
