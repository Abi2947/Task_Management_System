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
  Tooltip,
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
  const [username, setUsername] = useState("Task Warrior");
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
        <Typography variant="h3" fontWeight="bold" gutterBottom>
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

      {/* PERFECT SQUARE GRID */}
      <Grid container spacing={3}>
        {filteredTasks.map((task) => (
          <Grid item xs={6} sm={4} md={3} key={task._id}>
            <Card
              sx={{
                width: "100%",
                height: 260,
                borderRadius: 4,
                bgcolor: "#2c2c2c",
                color: "#fff",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent
                sx={{
                  flexGrow: 1,
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={1}
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
                      <Edit fontSize="small" sx={{ color: "#aaa" }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => deleteTask(task._id)}
                    >
                      <Delete fontSize="small" sx={{ color: "#ff6b6b" }} />
                    </IconButton>
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  color="#ccc"
                  sx={{
                    mb: 1.5,
                    flexGrow: 1,
                    fontSize: "0.95rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {task.description || "No description"}
                </Typography>

                <Box display="flex" gap={0.5} flexWrap="wrap" mb={1.5}>
                  {task.labels.map((l) => (
                    <Chip
                      key={l._id}
                      label={l.name}
                      size="small"
                      sx={{
                        bgcolor: l.color,
                        color: "white",
                        fontSize: "0.85rem",
                        height: 18,
                      }}
                    />
                  ))}
                </Box>

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
                    sx={{ fontSize: "0.85rem", height: 20 }}
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
                    sx={{ fontSize: "0.85rem", height: 20 }}
                  />
                </Box>

                {task.due_date && (
                  <Typography
                    variant="caption"
                    sx={{ color: "#aaa", fontSize: "0.8rem" }}
                  >
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? "Edit Task" : "Create New Task"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="dense"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Priority</InputLabel>
            <Select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
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
            InputLabelProps={{ shrink: true }}
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Labels</InputLabel>
            <Select
              multiple
              value={form.labels}
              onChange={(e) => setForm({ ...form, labels: e.target.value })}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((id) => {
                    const label = labels.find((l) => l._id === id);
                    return label ? (
                      <sunnyChip
                        key={id}
                        label={label.name}
                        size="small"
                        sx={{ bgcolor: label.color, color: "white" }}
                      />
                    ) : null;
                  })}
                </Box>
              )}
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

          <Box sx={{ mt: 2, p: 2, border: "1px dashed #666", borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              <LabelIcon fontSize="small" /> Create New Label
            </Typography>
            <TextField
              label="Name"
              size="small"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              sx={{ mr: 1, width: 140 }}
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
              sx={{ ml: 1 }}
            >
              Add
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTask ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
