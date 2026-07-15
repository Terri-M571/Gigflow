const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true }, // Full-time, Contract, etc.
  salary: { type: String },
  description: { type: String },
  requirements: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
