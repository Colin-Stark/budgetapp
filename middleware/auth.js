const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to protect routes
 * Verifies JWT token from request headers
 */
const auth = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production');
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = auth;