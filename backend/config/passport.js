const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const pool = require('./db');

module.exports = function(passport) {
    // Serialize user for session (if using sessions)
    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser(async (id, done) => {
        try {
            const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            done(null, result.rows[0]);
        } catch (err) {
            done(err, null);
        }
    });

    // ==========================================
    // GOOGLE OAUTH
    // ==========================================
    if (process.env.GOOGLE_CLIENT_ID) {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
            await handleOAuthLogin(profile, 'google', done);
        }));
    }

    // ==========================================
    // MICROSOFT OAUTH
    // ==========================================
    if (process.env.MICROSOFT_CLIENT_ID) {
        passport.use(new MicrosoftStrategy({
            clientID: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            callbackURL: "/api/auth/microsoft/callback",
            scope: ['user.read']
        },
        async (accessToken, refreshToken, profile, done) => {
            await handleOAuthLogin(profile, 'microsoft', done);
        }));
    }

    // ==========================================
    // LINKEDIN OAUTH
    // ==========================================
    if (process.env.LINKEDIN_CLIENT_ID) {
        passport.use(new LinkedInStrategy({
            clientID: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            callbackURL: "/api/auth/linkedin/callback",
            scope: ['r_emailaddress', 'r_liteprofile']
        },
        async (accessToken, refreshToken, profile, done) => {
            await handleOAuthLogin(profile, 'linkedin', done);
        }));
    }
};

// Generic OAuth handler
async function handleOAuthLogin(profile, provider, done) {
    try {
        const email = profile.emails[0].value;
        const name = profile.displayName || profile.name.givenName;
        const profilePicture = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

        // Check if user exists
        let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            // Register new user
            const insertUser = await pool.query(
                `INSERT INTO users (email, is_verified, auth_provider, oauth_id) 
                 VALUES ($1, true, $2, $3) RETURNING *`,
                [email, provider, profile.id]
            );
            const user = insertUser.rows[0];

            // Create profile
            await pool.query(
                `INSERT INTO profiles (user_id, full_name, profile_picture) VALUES ($1, $2, $3)`,
                [user.id, name, profilePicture]
            );

            return done(null, user);
        } else {
            // User exists, just log them in
            return done(null, userResult.rows[0]);
        }
    } catch (err) {
        return done(err, null);
    }
}
