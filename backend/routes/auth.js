const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// POST /api/auth/login
router.post('/login', (req, res) => {
  res.json({ message: "Login endpoint hit" });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  res.json({ message: "Register endpoint hit" });
});

module.exports = router; 