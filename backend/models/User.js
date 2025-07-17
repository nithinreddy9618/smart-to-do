const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // If you want to send real emails

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 