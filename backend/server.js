const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from public folder
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-todo';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const Task = require('./models/Task');
const User = require('./models/User');

// Routes
// Task routes
const taskRoutes = require('./routes/tasks');
app.use('/api/tasks', taskRoutes);
    
// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Catch-all route to serve index.html for SPA support (must be last)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 