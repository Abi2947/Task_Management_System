// Main server file
// Sets up Express, connects to DB, mounts routes, Swagger for docs
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv"); // For loading env variables
const cors = require("cors"); // Enable CORS for client requests
const swaggerUi = require("swagger-ui-express"); // For API documentation
const swaggerJsdoc = require("swagger-jsdoc");
const connectDB = require("./config/db");

dotenv.config(); // Load .env file

const app = express();

// Connect to database
connectDB();

app.use(express.json()); // Parse JSON bodies
app.use(cors({ origin: "http://localhost:3000" })); // Allow cross-origin requests

// Mount routes
app.use("/", require("./routes/auth"));
app.use("/tasks", require("./routes/tasks"));
app.use("/labels", require("./routes/labels"));

// Swagger setup for API documentation (plus points)
// Define OpenAPI spec
const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Task Manager API", version: "1.0.0" },
  },
  apis: ["./routes/*.js"], // Scan routes for JSDoc comments
};
const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs)); // Serve docs at /api-docs

// Global error handler
// Catches unhandled errors
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000; // Use env PORT or default
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // Export app for testing
