const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const pool = require('../config/db');

// Helper to extract session token from Authorization header or cookie
const getTokenFromRequest = (req) => {
    let token = null;
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    if (!token && req.cookies) {
        token = req.cookies.sb_access_token;
    }
    return token;
};

// Public route to check configured OAuth providers
router.get('/config', (req, res) => {
    res.json({
        success: true,
        oauth: {
            google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.trim() !== ''),
            linkedin: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_ID.trim() !== ''),
            microsoft: !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_ID.trim() !== '')
        }
    });
});

// ==========================================
// REGISTER
// ==========================================
router.post('/register', async (req, res) => {
    const { fullName, email, password, industry } = req.body;

    if (!fullName || !email || !password || !industry) {
        return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    try {
        // Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        const user = data.user;

        // Insert into public profiles table using PostgreSQL pool
        await pool.query(
            `INSERT INTO profiles (user_id, full_name, industry) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (user_id) DO UPDATE 
             SET full_name = EXCLUDED.full_name, industry = EXCLUDED.industry`,
            [user.id, fullName, industry]
        );

        // Also track career analytics for dashboard matching
        await pool.query(
            `INSERT INTO career_analytics (user_id, profile_views, applications_count, skills_match_ratio)
             VALUES ($1, 0, 0, 0.00)
             ON CONFLICT DO NOTHING`,
            [user.id]
        );

        // Set session cookie if immediately logged in (verification disabled scenario)
        if (data.session) {
            res.cookie('sb_access_token', data.session.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: data.session.expires_in * 1000,
                sameSite: 'lax'
            });
            return res.status(201).json({
                success: true,
                token: data.session.access_token,
                user: { id: user.id, email: user.email, full_name: fullName, industry },
                message: 'Registration successful!'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify.'
        });

    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ==========================================
// LOGIN
// ==========================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        const session = data.session;
        const user = data.user;

        // Fetch User Profile
        const profileResult = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [user.id]);
        const profile = profileResult.rows[0] || { full_name: user.email.split('@')[0], industry: 'Other' };

        // Set Session HTTP-Only Cookie
        res.cookie('sb_access_token', session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: session.expires_in * 1000, // standard 3600s
            sameSite: 'lax'
        });

        res.json({
            success: true,
            token: session.access_token,
            user: {
                id: user.id,
                email: user.email,
                full_name: profile.full_name,
                industry: profile.industry
            }
        });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ==========================================
// LOGOUT
// ==========================================
router.post('/logout', async (req, res) => {
    try {
        const token = getTokenFromRequest(req);
        if (token) {
            // Sign out of Supabase Auth
            await supabase.auth.signOut(token).catch(() => {});
        }
        res.clearCookie('sb_access_token');
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ==========================================
// SESSION CHECK & ME
// ==========================================
router.get('/session', async (req, res) => {
    const token = getTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ success: false, message: 'No active session' });
    }

    try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
            res.clearCookie('sb_access_token');
            return res.status(401).json({ success: false, message: 'Session expired' });
        }

        const user = data.user;
        const profileResult = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [user.id]);
        const profile = profileResult.rows[0] || {};

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                full_name: profile.full_name,
                industry: profile.industry,
                ...profile
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.get('/me', async (req, res) => {
    const token = getTokenFromRequest(req);
    if (!token) {
        return res.status(401).json({ success: false, message: 'No active session' });
    }

    try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
            res.clearCookie('sb_access_token');
            return res.status(401).json({ success: false, message: 'Session expired' });
        }

        const user = data.user;
        const profileResult = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [user.id]);
        const profile = profileResult.rows[0] || {};

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                full_name: profile.full_name,
                industry: profile.industry,
                ...profile
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ==========================================
// FORGOT & RESET PASSWORD
// ==========================================
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Please provide email' });
    }
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password.html`
        });
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { password, token } = req.body;
    if (!password) {
        return res.status(400).json({ success: false, message: 'Please provide new password' });
    }
    try {
        let activeToken = token || req.cookies.sb_access_token;
        if (!activeToken) {
            return res.status(400).json({ success: false, message: 'No active session or token found' });
        }
        const { error } = await supabase.auth.updateUser({
            password: password
        }, {
            accessToken: activeToken
        });
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.json({ success: true, message: 'Password reset successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// OAUTH FLOWS (Supabase redirects)
// ==========================================
router.get('/oauth/:provider', async (req, res) => {
    const provider = req.params.provider; // google, microsoft, linkedin
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/auth/callback`
            }
        });

        if (error) {
            return res.redirect(`/login.html?error=${encodeURIComponent(error.message)}`);
        }

        res.redirect(data.url);
    } catch (err) {
        res.redirect('/login.html?error=OAuthRedirectFailed');
    }
});

// OAuth Callback (handles token code exchange)
router.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session) {
            res.cookie('sb_access_token', data.session.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: data.session.expires_in * 1000,
                sameSite: 'lax'
            });
            return res.redirect('/dashboard.html');
        }
    }
    res.redirect('/login.html?error=OAuthCallbackFailed');
});

module.exports = router;
