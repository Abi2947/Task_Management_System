// Labels controllers
// Handles business logic for label CRUD operations
const { validationResult } = require("express-validator");
const Label = require("../models/Label");

// Create label controller
const createLabel = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const label = new Label(req.body);
    await label.save();
    res.status(201).json(label);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get labels controller
const getLabels = async (req, res) => {
  try {
    const labels = await Label.find();
    res.json(labels);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update label controller
const updateLabel = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const label = await Label.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }); // Return updated doc
    if (!label) return res.status(404).json({ message: "Label not found" });
    res.json(label);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete label controller
const deleteLabel = async (req, res) => {
  try {
    const label = await Label.findByIdAndDelete(req.params.id);
    if (!label) return res.status(404).json({ message: "Label not found" });
    res.json({ message: "Label deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createLabel, getLabels, updateLabel, deleteLabel };
