const jwt = require('jsonwebtoken');
require('dotenv').config();

const tokenBlacklist = new Set();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, error: "Access token required" });
    if (tokenBlacklist.has(token)) return res.status(401).json({ success: false, error: "Token invalidated" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, error: "Invalid or expired token" });
        req.user = user;
        next();
    });
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ success: false, error: "Admins only" });
    }
    next();
};

const employeeOnly = (req, res, next) => {
    if (req.user.role !== 'employee') return res.status(403).json({ success: false, error: "Employees only" });
    next();
};

const invalidateToken = (token) => {
    tokenBlacklist.add(token);
    if (tokenBlacklist.size > 1000) {
        const tokensArray = Array.from(tokenBlacklist);
        tokenBlacklist.clear();
        tokensArray.slice(-500).forEach(t => tokenBlacklist.add(t));
    }
};

module.exports = { authMiddleware, adminOnly, employeeOnly, invalidateToken };
