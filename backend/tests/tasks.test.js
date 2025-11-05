/**
 * TASKS API TEST SUITE
 * Complete integration tests for task management
 * Covers:
 * - CRUD operations with JWT authentication
 * - Task ownership enforcement
 * - Multiple labels per task
 * - Filtering, sorting, and pagination (25 tasks/page)
 * - Input validation & sanitization
 * - Error handling and proper status codes
 */

const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/User");
const Task = require("../models/Task");
const Label = require("../models/Label");
const jwt = require("jsonwebtoken");

let token; // JWT token for authenticated requests
let userId; // Current user's ID
let labelId; // Reusable label ID

/**
 * SETUP: Initialize test data before all tests
 * - Create test user
 * - Generate JWT token
 * - Create a label for task assignment
 */
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await require("./config/db")();
  }

  // Create test user
  const user = await User.create({
    username: "taskuser",
    email: "task@example.com",
    password: "password123",
  });
  userId = user._id;

  // Generate valid JWT token
  token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "fallback_secret",
    {
      expiresIn: "1h",
    }
  );

  // Create a label for testing
  const label = await Label.create({ name: "Urgent", color: "#FF0000" });
  labelId = label._id;
});

// CLEANUP: Reset tasks before each test

beforeEach(async () => {
  await Task.deleteMany({});
});

// TEARDOWN: Clean up all test data and close DB

afterAll(async () => {
  await User.deleteMany({});
  await Label.deleteMany({});
  await mongoose.connection.close();
});

// TASKS API TESTS

describe("Tasks API", () => {
  // TEST 1: Create task (authorized)
  it("should create a new task for authenticated user", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Complete Project",
        description: "Finish backend API",
        status: "in-progress",
        priority: "high",
        due_date: "2025-12-31",
        labels: [labelId],
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Complete Project");
    expect(res.body.user.toString()).toBe(userId.toString());
    expect(res.body.labels).toContain(labelId.toString());
  });

  // TEST 2: Reject invalid task data
  it("should return 400 for invalid task data", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "", // Required
        status: "invalid-status", // Not in enum
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  // TEST 3: Reject unauthenticated create
  it("should reject task creation without auth", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Sneaky Task" });

    expect(res.status).toBe(401);
  });

  // TEST 4: Get tasks with filter, sort, pagination
  it("should get tasks with filtering, sorting, and pagination", async () => {
    await Task.insertMany([
      {
        title: "A",
        status: "pending",
        priority: "high",
        due_date: "2025-01-01",
        user: userId,
      },
      {
        title: "B",
        status: "completed",
        priority: "low",
        due_date: "2025-02-01",
        user: userId,
      },
      {
        title: "C",
        status: "pending",
        priority: "high",
        due_date: "2025-01-15",
        user: userId,
      },
    ]);

    const res = await request(app)
      .get("/tasks?status=pending&priority=high&sort=asc&page=1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBe(2);
    expect(res.body.tasks[0].title).toBe("A"); // Sorted by due_date
    expect(res.body.total).toBe(2);
    expect(res.body.pages).toBe(1);
  });

  // TEST 5: Reject unauthenticated GET
  it("should reject getting tasks without auth", async () => {
    const res = await request(app).get("/tasks");
    expect(res.status).toBe(401);
  });

  // TEST 6: Update own task
  it("should allow user to update their own task", async () => {
    const task = await Task.create({ title: "Old Title", user: userId });

    const res = await request(app)
      .put(`/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New Title", status: "completed" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("New Title");
    expect(res.body.status).toBe("completed");
  });

  // TEST 7: Block update of someone else's task
  it("should block updating non-owned task", async () => {
    const otherUser = await User.create({
      username: "hacker",
      email: "hack@evil.com",
      password: "pass",
    });
    const task = await Task.create({
      title: "Secret Task",
      user: otherUser._id,
    });

    const res = await request(app)
      .put(`/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Hacked!" });

    expect(res.status).toBe(404); // Enforced ownership
  });

  // TEST 8: Delete own task
  it("should allow deleting own task", async () => {
    const task = await Task.create({ title: "Delete Me", user: userId });

    const res = await request(app)
      .delete(`/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Task deleted");
  });

  // TEST 9: Block delete of non-owned task
  it("should block deleting non-owned task", async () => {
    const otherUser = await User.create({
      username: "victim",
      email: "victim@safe.com",
      password: "pass",
    });
    const task = await Task.create({ title: "Protected", user: otherUser._id });

    const res = await request(app)
      .delete(`/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
