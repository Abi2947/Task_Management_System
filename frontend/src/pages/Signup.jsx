import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  Paper,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";

const Signup = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/signup", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper elevation={10} sx={{ p: 5, maxWidth: 420, borderRadius: 3 }}>
        <Box textAlign="center" mb={3}>
          <img src="/logo192.png" alt="TaskMaster" width="80" />
        </Box>

        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Join Task Master
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          mb={3}
        >
          Manage your tasks efficiently and stay organized.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={submit}
          sx={{ gap: 2.5, display: "flex", flexDirection: "column" }}
        >
          <TextField
            name="username"
            label="Username"
            value={form.username}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            fullWidth
          />

          <Button
            type="submit"
            disabled={loading}
            sx={{
              bgcolor: "#1976d2",
              color: "white",
              fontWeight: "bold",
              py: 1.5,
              borderRadius: 3,
              "&:hover": { bgcolor: "#1565c0" },
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Create Account"}
          </Button>
        </Box>

        <Typography align="center" mt={3}>
          Have an account?{" "}
          <Link to="/login" style={{ color: "#1976d2", fontWeight: "bold" }}>
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Signup;
