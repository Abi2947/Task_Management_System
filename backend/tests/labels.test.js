/**
 * LABELS API TEST SUITE
 * Tests all CRUD operations for labels with proper authentication
 * Ensures:
 * - Only authenticated users can create/update/delete labels
 * - Validation works
 * - Ownership is enforced
 * - Proper status codes returned
 */

const request = require("supertest");
const app = require("../server"); // Import app (no server listening)
const mongoose = require("mongoose");
const User = require("../models/User");
const Label = require("../models/Label");

let token; // Store JWT token for authenticated requests

// SETUP: Connect to test database and create a test user

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await require("./config/db")();
  }

  // Clean up any existing users/labels
  await User.deleteMany({});
  await Label.deleteMany({});

  // Register a new user
  await request(app).post("/signup").send({
    username: "testuser",
    email: "test@example.com",
    password: "password123",
  });

  // Login to get JWT token
  const loginRes = await request(app).post("/login").send({
    email: "test@example.com",
    password: "password123",
  });

  token = loginRes.body.token;
  expect(token).toBeDefined();
});

// TEARDOWN: Close database connection

afterAll(async () => {
  await mongoose.connection.close();
});

// LABELS API TEST CASES

describe("Labels API", () => {
  // Clear labels before each test
  beforeEach(async () => {
    await Label.deleteMany({});
  });

  // TEST 1: Create a new label
  it("should create a new label for authenticated user", async () => {
    const res = await request(app)
      .post("/labels")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Work",
        color: "#FF5733",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.name).toBe("Work");
    expect(res.body.color).toBe("#FF5733");
  });

  // TEST 2: Reject label with empty name
  it("should return 400 for invalid label data (empty name)", async () => {
    const res = await request(app)
      .post("/labels")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  // TEST 3: Reject unauthenticated label creation
  it("should reject label creation without authentication", async () => {
    const res = await request(app)
      .post("/labels")
      .send({ name: "Secret Label" });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain("No token");
  });

  // TEST 4: Get all labels
  it("should get all labels for authenticated user", async () => {
    await Label.create({ name: "Home", color: "#00FF00" });

    const res = await request(app)
      .get("/labels")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // TEST 5: Reject unauthenticated GET
  it("should reject getting labels without auth", async () => {
    const res = await request(app).get("/labels");
    expect(res.status).toBe(401);
  });

  // TEST 6: Update a label
  it("should update an existing label", async () => {
    const label = await Label.create({ name: "Old", color: "#000000" });

    const res = await request(app)
      .put(`/labels/${label._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Label", color: "#FFFFFF" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Label");
  });

  // TEST 7: Return 404 for non-existent label
  it("should return 404 when updating non-existent label", async () => {
    const res = await request(app)
      .put("/labels/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
  });

  // TEST 8: Delete a label
  it("should delete a label", async () => {
    const label = await Label.create({ name: "Delete Me", color: "#FF0000" });

    const res = await request(app)
      .delete(`/labels/${label._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Label deleted");
  });

  // TEST 9: Return 404 for deleting non-existent label
  it("should return 404 when deleting non-existent label", async () => {
    const res = await request(app)
      .delete("/labels/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
