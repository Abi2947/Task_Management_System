// src/components/Header.jsx
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Box,
  Button,
} from "@mui/material";
import {
  Brightness7 as SunIcon,
  Brightness4 as MoonIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Header = ({ darkMode, toggleDarkMode, username = "Aabin" }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: darkMode ? "#1a1a1a" : "#6a1b9a",
        color: "white",
        boxShadow: "0 4px 20px rgba(106, 27, 154, 0.3)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo */}
        <Typography
          variant="h5"
          component="div"
          sx={{ fontWeight: "bold", letterSpacing: 1 }}
        >
          TaskMaster
        </Typography>

        {/* Right Side */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          {/* Welcome */}
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Welcome, <strong>{username}</strong>
          </Typography>

          {/* Dark Mode Toggle */}
          <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
            <IconButton
              onClick={toggleDarkMode}
              sx={{
                bgcolor: darkMode ? "#333" : "#fff",
                color: darkMode ? "#ffd700" : "#6a1b9a",
                "&:hover": {
                  bgcolor: darkMode ? "#444" : "#f0e6ff",
                  transform: "scale(1.1)",
                },
                transition: "all 0.3s",
              }}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </IconButton>
          </Tooltip>

          {/* Avatar */}
          <Avatar
            sx={{
              bgcolor: "#fff",
              color: "#6a1b9a",
              fontWeight: "bold",
              width: 40,
              height: 40,
              cursor: "pointer",
            }}
          >
            {username[0].toUpperCase()}
          </Avatar>

          {/* Logout */}
          <Tooltip title="Logout">
            <IconButton onClick={handleLogout}>
              <LogoutIcon sx={{ color: "#ff6b6b" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
