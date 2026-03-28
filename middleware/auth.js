/**
 * Authentication Middleware
 * Protects admin/write routes using a simple API key check.
 */
const config = require('../config');

/**
 * Middleware to require a valid admin key in the X-Admin-Key header.
 */
function requireAdmin(req, res, next) {
    const adminKey = req.headers['x-admin-key'];

    if (!adminKey || adminKey !== config.adminKey) {
        console.warn(`[AUTH] Unauthorized access attempt from ${req.ip}`);
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'A valid admin key is required to perform this action.' 
        });
    }

    next();
}

module.exports = { requireAdmin };
