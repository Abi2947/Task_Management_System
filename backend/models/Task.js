// Task model schema using Mongoose
// This handles task data, including references to User and Labels
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Required title for the task
  description: { type: String }, // Optional description
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  }, // Enum for status filtering
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  }, // Enum for priority filtering
  due_date: { type: Date }, // Date for sorting tasks
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to owner user (ensures only creator can act on it)
  labels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Label" }], // Array of label references (multiple labels per task, default empty)
  createdAt: { type: Date, default: Date.now }, // Creation timestamp
  updatedAt: { type: Date, default: Date.now }, // Update timestamp
});

module.exports = mongoose.model("Task", taskSchema);
