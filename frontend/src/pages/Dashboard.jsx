// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Container,
  Typography,
  Fab,
  Card,
  CardContent,
  Chip,
  Grid,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Button,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  FilterList,
  Label as LabelIcon,
} from "@mui/icons-material";

export default function Dashboard({ token, darkMode }) {
  const [tasks, setTasks] = useState([]);
  const [labels, setLabels] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    due_date: "",
    labels: [],
  });
  const [username, setUsername] = useState();
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#1976d2");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
      } catch (err) {
        console.error("Invalid token");
      }
    }
  }, [token]);

  const fetchData = async () => {
    const [taskRes, labelRes] = await Promise.all([
      axios.get("http://localhost:5000/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get("http://localhost:5000/labels", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    setTasks(taskRes.data.tasks || []);
    setLabels(labelRes.data);
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSubmit = async () => {
    const url = editingTask ? `/tasks/${editingTask._id}` : "/tasks";
    const method = editingTask ? "put" : "post";
    await axios[method](`http://localhost:5000${url}`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOpen(false);
    setEditingTask(null);
    setForm({
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      due_date: "",
      labels: [],
    });
    fetchData();
  };

  const deleteTask = async (id) => {
    await axios.delete(`http://localhost:5000/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const createLabel = async () => {
    if (!newLabelName.trim()) return;
    await axios.post(
      "http://localhost:5000/labels",
      { name: newLabelName, color: newLabelColor },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setNewLabelName("");
    setNewLabelColor("#1976d2");
    fetchData();
  };

  const filteredTasks = tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    return true;
  });

  return (
    <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h3"
          fontWeight="bold"
          gutterBottom
          color="text.primary"
        >
          Welcome back, Task Warrior! <strong>{username}</strong>
        </Typography>
        <Typography variant="h6" color="text.secondary">
          You have <strong>{filteredTasks.length}</strong> tasks today
        </Typography>
      </Box>

      <Box
        display="flex"
        gap={2}
        mb={4}
        flexWrap="wrap"
        justifyContent="center"
      >
        <Chip
          icon={<FilterList />}
          label="All"
          onClick={() => setFilters({})}
          color="primary"
          variant="outlined"
        />
        {["pending", "in-progress", "completed"].map((s) => (
          <Chip
            key={s}
            label={s}
            onClick={() => setFilters({ ...filters, status: s })}
            color={filters.status === s ? "primary" : "default"}
            clickable
          />
        ))}
      </Box>

      {/* SQUARE CARDS — AUTO LIGHT/DARK */}
      <Grid container spacing={3}>
        {filteredTasks.map((task) => (
          <Grid item xs={6} sm={4} md={3} key={task._id}>
            <Card
              sx={{
                width: "100%",
                height: 300,
                borderRadius: 4,
                bgcolor: darkMode ? "#1e1e1e" : "background.paper",
                color: darkMode ? "#fff" : "text.primary",
                boxShadow: darkMode
                  ? "0 8px 32px rgba(0,0,0,0.4)"
                  : "0 8px 32px rgba(0,0,0,0.12)",
                border: darkMode ? "1px solid #333" : "1px solid #e0e0e0",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: darkMode
                    ? "0 16px 48px rgba(0,0,0,0.6)"
                    : "0 16px 48px rgba(0,0,0,0.2)",
                },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent
                sx={{
                  flexGrow: 1,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Title + Actions */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={1.5}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ fontSize: "1.25rem", lineHeight: 1.3 }}
                  >
                    {task.title}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingTask(task);
                        setForm({
                          ...task,
                          labels: task.labels.map((l) => l._id),
                        });
                        setOpen(true);
                      }}
                    >
                      <Edit
                        fontSize="small"
                        sx={{ color: darkMode ? "#aaa" : "#666" }}
                      />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => deleteTask(task._id)}
                    >
                      <Delete fontSize="small" sx={{ color: "#ff6b6b" }} />
                    </IconButton>
                  </Box>
                </Box>

                {/* SCROLLABLE DESCRIPTION */}
                <Box
                  sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    pr: 1,
                    mb: 2,
                    "&::-webkit-scrollbar": { width: 6 },
                    "&::-webkit-scrollbar-track": {
                      background: darkMode ? "#333" : "#f1f1f1",
                      borderRadius: 10,
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: darkMode ? "#666" : "#bbb",
                      borderRadius: 10,
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      background: darkMode ? "#888" : "#999",
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                      color: darkMode ? "#ddd" : "text.secondary",
                    }}
                  >
                    {task.description || "No description"}
                  </Typography>
                </Box>

                {/* Labels */}
                <Box display="flex" gap={0.7} flexWrap="wrap" mb={2}>
                  {task.labels.map((l) => (
                    <Chip
                      key={l._id}
                      label={l.name}
                      size="small"
                      sx={{
                        bgcolor: l.color,
                        color: "white",
                        fontSize: "0.85rem",
                        height: 22,
                      }}
                    />
                  ))}
                </Box>

                {/* Status + Priority */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Chip
                    label={task.status}
                    size="small"
                    color={
                      task.status === "completed"
                        ? "success"
                        : task.status === "in-progress"
                        ? "warning"
                        : "default"
                    }
                    sx={{ fontSize: "0.85rem", height: 24 }}
                  />
                  <Chip
                    label={task.priority}
                    size="small"
                    color={
                      task.priority === "high"
                        ? "error"
                        : task.priority === "medium"
                        ? "warning"
                        : "success"
                    }
                    sx={{ fontSize: "0.85rem", height: 24 }}
                  />
                </Box>

                {/* Due Date */}
                {task.due_date && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: darkMode ? "#aaa" : "#777",
                      fontSize: "0.85rem",
                    }}
                  >
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FAB */}
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 32, right: 32 }}
        onClick={() => {
          setEditingTask(null);
          setForm({
            title: "",
            description: "",
            status: "pending",
            priority: "medium",
            due_date: "",
            labels: [],
          });
          setOpen(true);
        }}
      >
        <Add />
      </Fab>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { bgcolor: darkMode ? "#1e1e1e" : "background.paper" },
        }}
      >
        <DialogTitle sx={{ color: darkMode ? "#fff" : "text.primary" }}>
          {editingTask ? "Edit Task" : "Create New Task"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="dense"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            InputLabelProps={{ style: { color: darkMode ? "#ccc" : "#666" } }}
            sx={{ input: { color: darkMode ? "#fff" : "#000" } }}
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            InputLabelProps={{ style: { color: darkMode ? "#ccc" : "#666" } }}
            sx={{ textarea: { color: darkMode ? "#fff" : "#000" } }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ color: darkMode ? "#ccc" : "#666" }}>
              Status
            </InputLabel>
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              sx={{ color: darkMode ? "#fff" : "#000" }}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ color: darkMode ? "#ccc" : "#666" }}>
              Priority
            </InputLabel>
            <Select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              sx={{ color: darkMode ? "#fff" : "#000" }}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Due Date"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{
              shrink: true,
              style: { color: darkMode ? "#ccc" : "#666" },
            }}
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            sx={{ input: { color: darkMode ? "#fff" : "#000" } }}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ color: darkMode ? "#ccc" : "#666" }}>
              Labels
            </InputLabel>
            <Select
              multiple
              value={form.labels}
              onChange={(e) => setForm({ ...form, labels: e.target.value })}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((id) => {
                    const label = labels.find((l) => l._id === id);
                    return label ? (
                      <Chip
                        key={id}
                        label={label.name}
                        size="small"
                        sx={{ bgcolor: label.color, color: "white" }}
                      />
                    ) : null;
                  })}
                </Box>
              )}
              sx={{ color: darkMode ? "#fff" : "#000" }}
            >
              {labels.map((label) => (
                <MenuItem key={label._id} value={label._id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        bgcolor: label.color,
                      }}
                    />
                    {label.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box
            sx={{
              mt: 2,
              p: 2,
              border: `1px dashed ${darkMode ? "#666" : "#ccc"}`,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ color: darkMode ? "#fff" : "text.primary" }}
            >
              <LabelIcon fontSize="small" /> Create New Label
            </Typography>
            <TextField
              label="Name"
              size="small"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              sx={{
                mr: 1,
                width: 140,
                input: { color: darkMode ? "#fff" : "#000" },
              }}
              InputLabelProps={{ style: { color: darkMode ? "#ccc" : "#666" } }}
            />
            <TextField
              type="color"
              size="small"
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">Color</InputAdornment>
                ),
              }}
              sx={{ width: 100 }}
            />
            <Button
              onClick={createLabel}
              variant="outlined"
              size="small"
              sx={{ ml: 1, color: darkMode ? "#fff" : "primary" }}
            >
              Add
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            sx={{ color: darkMode ? "#ccc" : "text.secondary" }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTask ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
