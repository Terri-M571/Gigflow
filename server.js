require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Security Headers (Basic)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gigflow', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Database'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Models
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

// ==========================================
// API ROUTES
// ==========================================

// --- AUTHENTICATION ---
// In a real app, use bcrypt & JWT. For the MVP launch, we use simple user ID matching.
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        
        // Auto-register for the MVP to ensure smooth user testing
        if (!user) {
            user = await User.create({ name: email.split('@')[0], email, password });
        } else if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful', userId: user._id, user });
    } catch (error) {
        res.status(500).json({ error: 'Server error during authentication' });
    }
});

// --- USER PROFILE ---
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/users/:id/profile', async (req, res) => {
    try {
        // Sanitize to prevent basic XSS in bio/title
        const updateData = { ...req.body };
        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// --- JOBS ---
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true }).sort('-createdAt');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// --- APPLICATIONS ---
app.post('/api/applications', async (req, res) => {
    try {
        const { jobId, userId, fullName, email, phone, linkedin, coverLetter } = req.body;
        
        if (!jobId || !userId || !fullName || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Extremely simple sanitize
        const sanitize = str => str ? String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

        const application = await Application.create({
            jobId,
            userId,
            fullName: sanitize(fullName),
            email: sanitize(email),
            phone: sanitize(phone),
            linkedin: sanitize(linkedin),
            coverLetter: sanitize(coverLetter)
        });

        res.status(201).json({ message: 'Application securely submitted!', application });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// ==========================================
// STATIC FILES & FALLBACK ROUTING
// ==========================================
// Serve the current directory as static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// For any unknown route, fallback to index.html (SPA behavior)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🚀 GigFlow Express Backend running on port ${PORT}`);
    console.log(`===================================================`);
});
