const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');
const User = require('../models/User');

console.log("Registering router.get: /");
// Get all tasks for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

console.log("Registering router.post: /");
// Add a new task for the logged-in user
router.post('/',auth, async (req, res) => {
  try {
    const { text, dueDate } = req.body;
    const userId = req.user.userId;

    const task = new Task({
      text,
      user: userId,
      dueDate: dueDate ? new Date(dueDate) : undefined // This will interpret as local time
    });
    await task.save();

    // Check if the task is overdue or due soon (e.g., within 1 hour)
    if (dueDate) {
      const due = new Date(dueDate);
      const now = new Date();
      const soon = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

      if (due <= soon) {
        // Get user email
        const user = await User.findById(userId);
        if (user && user.email) {
          // Send email alert
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'bnkr9618@gmail.com',
              pass: 'xeay byvv eghp ihnl'
            }
          });

          const mailOptions = {
            to: user.email,
            subject: 'Task Due Soon!',
            text: `Your task "${text}" is due at ${due.toLocaleString()}. Please complete it soon!`
          };

          await transporter.sendMail(mailOptions);
        }
      }
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

console.log("Registering router.put: /:id");
// Update a task (edit text or completed) for the logged-in user
router.put('/:id', auth, async (req, res) => {
  try {
    const { text, completed, dueDate } = req.body;
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { text, completed, dueDate },
      { new: true }
    );
    if (!updatedTask) return res.status(404).json({ error: 'Task not found' });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

console.log("Registering router.delete: /:id");
// Delete a task for the logged-in user
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 