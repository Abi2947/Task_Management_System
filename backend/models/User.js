// User model schema using Mongoose
// This defines the structure for user data, including authentication fields
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // For hashing passwords securely

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Unique username for identification
  email: { type: String, required: true, unique: true }, // Unique email for login
  password: { type: String, required: true }, // Hashed password (never store plain text)
  createdAt: { type: Date, default: Date.now }, // Timestamp for when user was created
  updatedAt: { type: Date, default: Date.now }, // Timestamp for last update
});

// Pre-save hook to hash password before storing in DB
// This ensures sensitive data (password) is encrypted as per requirements
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password not changed
  this.password = await bcrypt.hash(this.password, 10); // Hash with salt rounds=10 for security
  next();
});

// Method to compare provided password with hashed one during login
userSchema.methods.comparePassword = async function (candidatepassword) {
  return bcrypt.compare(candidatepassword, this.password); // Returns true if match
};

module.exports = mongoose.model("User", userSchema);
