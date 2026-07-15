const supabase = require('../config/supabase');

module.exports = async function(req, res, next) {
    // 1. Check Authorization Header first
    let token = null;
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    // 2. Fallback to Cookie
    if (!token && req.cookies) {
        token = req.cookies.sb_access_token;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    try {
        // Verify token directly with Supabase auth service
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
            return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
        }

        req.user = data.user;
        next();
    } catch (err) {
        res.status(500).json({ success: false, message: 'Authentication server error' });
    }
};
