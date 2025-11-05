// controllers/tasksController.js
const { validationResult } = require("express-validator");
const Task = require("../models/Task");

const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const task = new Task({ ...req.body, user: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getTasks = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { status, priority, sort = "asc", page = 1 } = req.query;
  const limit = 25;
  const skip = (page - 1) * limit;

  const filter = { user: req.user.id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const sortObj = { due_date: sort === "asc" ? 1 : -1 };

  try {
    const tasks = await Task.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate("labels");
    const total = await Task.countDocuments(filter);
    res.json({ tasks, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    Object.assign(task, req.body);
    task.updatedAt = Date.now();
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
