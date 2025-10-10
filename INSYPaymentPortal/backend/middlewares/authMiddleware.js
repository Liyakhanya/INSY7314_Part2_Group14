const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create a blacklist of tokens we have invalidated
const tokenBlacklist = new Set();

const verifyToken = (req, res, next) => {
    // strip the header (grab the auth field from the header)
    const authHeader = req.headers["authorization"];

    // we split after the space, as standard auth headers look like the following:
    // Bearer: <token> (and we just want the token aspect)
    const token = authHeader && authHeader.split(" ")[1];

    // if no token, 401 unauthorized
    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Access token required"
        });
    }
    
    // if a token that has been logged out, 401 unauthorized
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({
            success: false,
            error: "Token has been invalidated"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        // 403 - forbidden
        if (err) {
            return res.status(403).json({
                success: false,
                error: "Invalid or expired token"
            });
        }
        
        // Additional validation for customer type
        if (user.type !== 'customer') {
            return res.status(403).json({
                success: false,
                error: "Invalid token type"
            });
        }
        
        req.user = user;
        next();
    });
};

const invalidateToken = (token) => {
    tokenBlacklist.add(token);
    
    // Clean up old tokens periodically (in a real app, use Redis with TTL)
    if (tokenBlacklist.size > 1000) {
        const tokensArray = Array.from(tokenBlacklist);
        tokenBlacklist.clear();
        // Keep recent 500 tokens
        tokensArray.slice(-500).forEach(t => tokenBlacklist.add(t));
    }
};

module.exports = { verifyToken, invalidateToken };