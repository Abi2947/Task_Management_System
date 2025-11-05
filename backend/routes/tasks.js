// routes/tasks.js
const express = require("express");
const { body, query } = require("express-validator");
const auth = require("../middleware/auth");


const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/tasksController");

const router = express.Router();

// CREATE
router.post(
  "/",
  auth,
  [
    body("title").trim().notEmpty().escape(),
    body("status").optional().isIn(["pending", "in-progress", "completed"]),
    body("priority").optional().isIn(["low", "medium", "high"]),
    body("due_date").optional().isISO8601().toDate(),
    body("labels").optional().isArray(),
  ],
  createTask
);

// READ
router.get(
  "/",
  auth,
  [
    query("status").optional().isIn(["pending", "in-progress", "completed"]),
    query("priority").optional().isIn(["low", "medium", "high"]),
    query("sort").optional().isIn(["asc", "desc"]),
    query("page").optional().isInt({ min: 1 }),
  ],
  getTasks
);

// UPDATE
router.put(
  "/:id",
  auth,
  [
    body("title").optional().trim().notEmpty().escape(),
    body("status").optional().isIn(["pending", "in-progress", "completed"]),
    body("priority").optional().isIn(["low", "medium", "high"]),
    body("due_date").optional().isISO8601().toDate(),
    body("labels").optional().isArray(),
  ],
  updateTask
);

// DELETE
router.delete("/:id", auth, deleteTask);

module.exports = router;
