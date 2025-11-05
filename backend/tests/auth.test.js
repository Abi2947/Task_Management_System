/**
 * AUTHENTICATION API TEST SUITE
 * Tests user signup and login endpoints
 * Ensures:
 * - Successful registration with JWT token
 * - Validation for invalid inputs
 * - Duplicate email prevention
 * - Secure login with correct/incorrect credentials
 * - Proper error handling and status codes
 */

const request = require("supertest");
const app = require("../server"); // Import app (no server listening needed)
const mongoose = require("mongoose");
const User = require("../models/User");

// TEST SUITE: Auth API

describe("Auth API", () => {
  // SETUP: Clean database before each test

  beforeEach(async () => {
    await User.deleteMany({}); // Remove all users to ensure clean state
  });

  // TEARDOWN: Close MongoDB connection after all tests

  afterAll(async () => {
    await mongoose.connection.close(); // Prevent open handle leaks
  });

  // TEST 1: Successful user signup
  // Should create user and return JWT token

  it("should create a new user on signup", async () => {
    const res = await request(app).post("/signup").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token"); // JWT token must be returned
    expect(res.body.token).toMatch(/^ey/); // Token starts with 'ey' (JWT format)
  });

  // TEST 2: Validation errors for invalid signup data
  // Should reject empty username, invalid email, short password

  it("should return validation errors for invalid signup data", async () => {
    const res = await request(app).post("/signup").send({
      username: "", // Empty
      email: "invalidemail", // Not an email
      password: "short", // Less than 6 chars
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
    // Check specific error messages
    const errorMessages = res.body.errors.map((err) => err.msg);
    expect(errorMessages).toContain("Invalid value"); // From express-validator
  });

  // TEST 3: Prevent duplicate email registration
  // Should block second signup with same email

  it("should prevent signup with duplicate email", async () => {
    // First successful signup
    await request(app).post("/signup").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    // Attempt duplicate
    const res = await request(app).post("/signup").send({
      username: "anotheruser",
      email: "test@example.com", // Same email
      password: "password123",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("User already exists");
  });

  // TEST 4: Successful login
  // Should return JWT token for valid credentials

  it("should login existing user and return token", async () => {
    // Create user first
    await request(app).post("/signup").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    // Login
    const res = await request(app).post("/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
  });

  // TEST 5: Reject login with non-existent user

  it("should reject login with invalid credentials", async () => {
    const res = await request(app).post("/login").send({
      email: "nonexistent@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Invalid credentials");
  });

  // TEST 6: Reject login with wrong password

  it("should reject login with wrong password", async () => {
    // Create user
    await request(app).post("/signup").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    // Wrong password
    const res = await request(app).post("/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Invalid credentials");
  });

  // TEST 7: Validation for invalid login data

  it("should return validation errors for invalid login data", async () => {
    const res = await request(app).post("/login").send({
      email: "invalidemail", // Invalid format
      password: "", // Empty
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});
