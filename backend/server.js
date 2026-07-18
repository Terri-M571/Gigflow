require('dotenv').config();

// Environment Variable Hardening
const criticalVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY', 'DATABASE_URL'];
const missingVars = criticalVars.filter(v => !process.env[v] || process.env[v].includes('placeholder'));
if (missingVars.length > 0) {
    console.warn('\n=============================================================');
    console.warn('⚠️  STARTUP WARNING: Missing or Placeholder Environment Variables');
    console.warn(`   The following keys are not configured: ${missingVars.join(', ')}`);
    console.warn('   GigFlow will seamlessly fall back to local/emulator modes.');
    console.warn('=============================================================\n');
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require('cookie-parser');
const supabase = require('./config/supabase');

// Import Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: false, // Allow frontend inline scripts
}));

app.use(cors({
    origin: (origin, callback) => {
        // Dynamically allow any origin (including 'null' for file:// protocol) to support all local development ports and flows
        callback(null, true);
    },
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Parse JSON and Cookies
app.use(express.json());
app.use(cookieParser());

// Server-Side Protected HTML Redirect Guard
const protectedPages = [
    '/dashboard.html',
    '/profile.html',
    '/onboarding.html',
    '/jobs.html',
    '/job-details.html',
    '/apply.html',
    '/application-tracker.html',
    '/resume-builder.html',
    '/cover-letter.html',
    '/interview-prep.html',
    '/ai-interview.html',
    '/learning.html',
    '/portfolio.html',
    '/settings.html',
    '/analytics.html',
    '/ats-checker.html',
    '/live-coach.html',
    '/freelance.html',
    '/project-details.html'
];

app.use(async (req, res, next) => {
    const url = req.path;
    const isProtected = protectedPages.includes(url) || 
        (url.endsWith('.html') && !['/index.html', '/login.html', '/signup.html', '/pricing.html', '/forgot-password.html', '/reset-password.html'].includes(url));

    if (isProtected) {
        const token = req.cookies.sb_access_token;
        if (!token) {
            return res.redirect('/login.html');
        }
        
        // Validate session with Supabase
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
            res.clearCookie('sb_access_token');
            return res.redirect('/login.html');
        }
        
        // Inject user in request context
        req.user = data.user;
        next();
    } else {
        next();
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Catch-all to serve index.html for SPA-like behavior
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`🚀 GigFlow Backend running on port ${PORT}`);
});
