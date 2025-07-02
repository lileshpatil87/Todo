const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 8080;

app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(
    "mongodb+srv://lileshpatil38:CekPCYuGBQHg3gzN@cluster0.bxuwb04.mongodb.net/",
    { useNewUrlParser: true, useUnifiedTopology: true, ssl: true,
      tlsInsecure: false }
  )
  .then(console.log("Connected"));

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const taskSchema = new mongoose.Schema({
  text: String,
  status: String,
  priority: String,
  userId: mongoose.Schema.Types.ObjectId,
});

const Task = mongoose.model("Task", taskSchema);

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No Token" });
  try {
    const decode = jwt.verify(token, "secret");
    req.userId = decode.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

app.listen(PORT, (req, res) => {
  console.log("Listening");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username: username, password: hashed });
  await user.save();
  res.json({ message: `User Registered` });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!user || !isMatch) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }
  const token = jwt.sign({ userId: user._id }, "secret", { expiresIn: "1h" });
  res.json({ token });
});

// Task
app.get("/task", authMiddleware, async (req, res) => {
  const tasks = await Task.find({ userId: req.userId });
  res.json({ tasks });
});

app.post("/task", authMiddleware, async (req, res) => {
  const task = new Task({ ...req.body, userId: req.userId });
  await task.save();
  res.json({ task });
});

app.delete("/task/:id", authMiddleware, async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ message: "Task Deleted" });
});

// Update Status
app.patch("/task/:id/status", authMiddleware, async (req, res) => {
  const { status } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { status },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json({ task });
});

// Update Priority
app.patch("/task/:id/priority", authMiddleware, async (req, res) => {
  const { priority } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { priority },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json({ task });
});
