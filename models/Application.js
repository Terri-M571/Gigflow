const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  linkedin: { type: String },
  coverLetter: { type: String },
  
  status: { 
    type: String, 
    enum: ['Submitted', 'Under Review', 'Interview', 'Rejected', 'Accepted'],
    default: 'Submitted'
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
