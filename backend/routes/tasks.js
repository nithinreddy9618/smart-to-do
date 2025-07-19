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
router.post('/', auth, async (req, res) => {
  try {
    const { text, dueDate } = req.body;
    const userId = req.user.userId; // assuming you use auth middleware

    const task = new Task({
      text,
      user: userId,
      dueDate: dueDate ? new Date(dueDate) : undefined
    });
    await task.save();

    // Schedule email alert at due date
    if (dueDate) {
      const due = new Date(dueDate);
      const now = new Date();
      const delay = due.getTime() - now.getTime();

      if (delay > 0) {
        setTimeout(async () => {
          const user = await User.findById(userId);
          if (user && user.email) {
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'bnkr9618@gmail.com',
                pass: 'nxdy ijlo zelv fxha'
              }
            });

            const mailOptions = {
              to: user.email,
              subject: 'Task Due Now!',
              text: `Your task "${text}" is due now!`
            };

            try {
              await transporter.sendMail(mailOptions);
              console.log('Due date email sent to', user.email);
            } catch (emailErr) {
              console.error('Failed to send due date email:', emailErr);
            }
          }
        }, delay);
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