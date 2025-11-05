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

const Login = ({ setToken, setUsername }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email and password required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/login", {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUsername(res.data.user.username);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
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
          Welcome Back
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          mb={3}
        >
          Log in to manage your tasks
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
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            fullWidth
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
            fullWidth
          />

          <Button
            type="submit"
            disabled={loading}
            sx={{
              bgcolor: "#6a1b9a",
              color: "white",
              fontWeight: "bold",
              py: 1.5,
              borderRadius: 3,
              "&:hover": {
                bgcolor: "#4a148c",
              },
              boxShadow: "0 4px 15px rgba(106, 27, 154, 0.3)",
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
        </Box>

        <Typography align="center" mt={3} color="text.secondary">
          New here?{" "}
          <Link to="/signup" style={{ color: "#1877f2", fontWeight: "bold" }}>
            Create Account
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
