// Label model schema using Mongoose
// Labels are global but can be assigned to tasks
const mongoose = require("mongoose");

const labelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Unique name for the label
  color: { type: String, default: "#000000", match: /^#[0-9A-F]{6}$/i }, // Optional hex color code
  createdAt: { type: Date, default: Date.now }, // Creation timestamp
  updatedAt: { type: Date, default: Date.now }, // Update timestamp
});

module.exports = mongoose.model("Label", labelSchema);
