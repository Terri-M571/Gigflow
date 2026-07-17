const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'local_fallback_secret_key';

let supabaseClient;
const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes('placeholder') && supabaseUrl.trim() !== '' && 
                             supabaseServiceKey && !supabaseServiceKey.includes('placeholder') && supabaseServiceKey.trim() !== '';

if (isSupabaseConfigured) {
    try {
        supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
        console.log('✅ Supabase Auth Client initialized successfully.');
    } catch (e) {
        console.warn('⚠️ Supabase createClient failed. Falling back to Local Auth Emulator:', e.message);
        setupEmulator();
    }
} else {
    setupEmulator();
}

function setupEmulator() {
    console.log('⚠️ Supabase credentials missing/placeholder. Initializing Local Secure Auth Emulator (zero-config mode)...');
    
    supabaseClient = {
        auth: {
            signUp: async ({ email, password }) => {
                try {
                    // Check if user already exists
                    const check = await db.query('SELECT * FROM users WHERE email = $1', [email]);
                    if (check.rows.length > 0) {
                        return { data: { user: null, session: null }, error: { message: 'User already exists' } };
                    }

                    // Hash password using bcryptjs
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash(password, salt);

                    // Insert into users table
                    const userId = require('crypto').randomUUID();
                    await db.query(
                        'INSERT INTO users (id, email, password_hash, is_verified) VALUES ($1, $2, $3, 1)',
                        [userId, email, hash]
                    );

                    const user = { id: userId, email };
                    
                    // Generate JWT token
                    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '24h' });
                    const session = {
                        access_token: token,
                        expires_in: 86400,
                        user
                    };

                    return { data: { user, session }, error: null };
                } catch (e) {
                    console.error('SignUp Emulator Error:', e);
                    return { data: { user: null, session: null }, error: { message: e.message } };
                }
            },

            signInWithPassword: async ({ email, password }) => {
                try {
                    // Fetch user
                    const check = await db.query('SELECT * FROM users WHERE email = $1', [email]);
                    if (check.rows.length === 0) {
                        return { data: { user: null, session: null }, error: { message: 'Email not found' } };
                    }

                    const userRow = check.rows[0];
                    if (!userRow.password_hash) {
                        return { data: { user: null, session: null }, error: { message: 'User signed up with an OAuth provider' } };
                    }

                    // Compare password hash
                    const isMatch = await bcrypt.compare(password, userRow.password_hash);
                    if (!isMatch) {
                        return { data: { user: null, session: null }, error: { message: 'Incorrect password' } };
                    }

                    const user = { id: userRow.id, email: userRow.email };
                    const token = jwt.sign({ id: userRow.id, email: userRow.email }, JWT_SECRET, { expiresIn: '24h' });
                    const session = {
                        access_token: token,
                        expires_in: 86400,
                        user
                    };

                    return { data: { user, session }, error: null };
                } catch (e) {
                    console.error('SignIn Emulator Error:', e);
                    return { data: { user: null, session: null }, error: { message: e.message } };
                }
            },

            getUser: async (token) => {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    // Fetch user from DB to verify they still exist
                    const check = await db.query('SELECT id, email FROM users WHERE id = $1', [decoded.id]);
                    if (check.rows.length === 0) {
                        return { data: { user: null }, error: { message: 'User not found' } };
                    }
                    return { data: { user: check.rows[0] }, error: null };
                } catch (e) {
                    return { data: { user: null }, error: { message: e.message } };
                }
            },

            signOut: async (token) => {
                return { error: null };
            },

            resetPasswordForEmail: async (email, { redirectTo }) => {
                try {
                    const check = await db.query('SELECT * FROM users WHERE email = $1', [email]);
                    if (check.rows.length === 0) {
                        return { error: { message: 'Email not found' } };
                    }
                    // Generate reset token
                    const resetToken = require('crypto').randomBytes(20).toString('hex');
                    await db.query(
                        'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
                        [resetToken, new Date(Date.now() + 3600000).toISOString(), email]
                    );
                    
                    console.log(`🔑 Reset link generated (Simulated email): ${redirectTo}?token=${resetToken}`);
                    return { error: null };
                } catch (e) {
                    return { error: { message: e.message } };
                }
            },

            updateUser: async ({ password }, { accessToken }) => {
                try {
                    const decoded = jwt.verify(accessToken, JWT_SECRET);
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash(password, salt);
                    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, decoded.id]);
                    return { error: null };
                } catch (e) {
                    return { error: { message: e.message } };
                }
            }
        }
    };
}

module.exports = supabaseClient;
