const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  
  // Profile Details
  title: { type: String, default: '' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  skills: [{ type: String }],
  
  // Resume Builder Data
  resumeDetails: {
    phone: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    experience: [{
      company: String,
      role: String,
      years: String,
      description: String
    }],
    education: [{
      institution: String,
      degree: String,
      year: String
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
