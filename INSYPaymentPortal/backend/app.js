const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { connectToMongo } = require('./services/dbService.js');
const { securityMiddlewares } = require('./middlewares/securityMiddleware.js');
const testRoutes = require('./routes/testRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');
const authRoutes = require('./routes/authRoutes.js');

const app = express();

// security middlewares FIRST
securityMiddlewares(app);

// Body parsing middleware with enhanced limits and security
app.use(express.json({ 
    limit: '10kb', // Limiting body size to 10kb
    verify: (req, res, buf) => {
        // Checking for JSON parsing attacks
        try {
            JSON.parse(buf);
        } catch (e) {
            throw new Error('Invalid JSON payload');
        }
    }
}));

app.use(express.urlencoded({ 
    extended: true, 
    limit: '10kb',
    parameterLimit: 10 // Limiting the number of parameters
}));

// Enhanced logging middleware with security monitoring
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    console.log(`🔐 ${timestamp} - ${req.method} ${req.url} - IP: ${req.ip} - UA: ${userAgent.substring(0, 50)}`);
    
    // Logging security-relevant events
    if (req.path.includes('/auth/') || req.path.includes('/payments')) {
        console.log(`Security Event: ${req.method} ${req.path} - IP: ${req.ip}`);
    }
    
    next();
});

// Enhanced CORS for specific routes
app.use('/v1/auth', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Enhanced HEALTH CHECK with security headers
app.get('/health', (req, res) => {
    // Additional security headers for health endpoint
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    res.status(200).json({ 
        success: true,
        message: 'International Payments API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        secure: process.env.NODE_ENV === 'production'
    });
});

// API routes with route-specific security
app.use('/v1/test', testRoutes);
app.use('/v1/payments', paymentRoutes);
app.use('/v1/auth', authRoutes);

// Enhanced caching middleware for sensitive routes
app.use('/v1/auth', (req, res, next) => {
    // No caching for authentication endpoints
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});

app.use('/v1/payments', (req, res, next) => {
    // Limited caching for payment endpoints
    if (req.method === 'GET') {
        res.setHeader('Cache-Control', 'private, no-cache, max-age=300'); // 5 minutes for GET
    } else {
        res.setHeader('Cache-Control', 'no-store, no-cache');
    }
    next();
});

// Enhanced 404 handler with security headers
app.use('*', (req, res) => {
    // Security headers for 404 responses
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });
    
    // Security headers for error responses
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            errors,
            type: 'VALIDATION_ERROR'
        });
    }
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            error: `${field} already exists`,
            type: 'DUPLICATE_ERROR'
        });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token',
            type: 'AUTH_ERROR'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token expired',
            type: 'AUTH_ERROR'
        });
    }
    
    // Security-related errors
    if (err.message.includes('Invalid JSON') || err.message.includes('Unexpected token')) {
        return res.status(400).json({
            success: false,
            error: 'Invalid request payload',
            type: 'SECURITY_ERROR'
        });
    }
    
    // Generic error 
    const errorResponse = {
        success: false,
        error: 'Internal server error',
        type: 'SERVER_ERROR'
    };
    
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.details = err.message;
        errorResponse.stack = err.stack;
    }
    
    res.status(500).json(errorResponse);
});

const port = process.env.API_PORT || 3000;

// SSL Configuration for development and production
const startServer = () => {
    try {
        const sslOptions = {
            key: fs.readFileSync(path.join(__dirname, 'localhost+2-key.pem')),
            cert: fs.readFileSync(path.join(__dirname, 'localhost+2.pem')),
            // SSL security settings
            secureProtocol: 'TLSv1_2_method',
            ciphers: [
                'ECDHE-RSA-AES128-GCM-SHA256',
                'ECDHE-RSA-AES256-GCM-SHA384',
                'ECDHE-RSA-AES128-SHA256',
                'ECDHE-RSA-AES256-SHA384'
            ].join(':'),
            honorCipherOrder: true
        };

        // Always use HTTPS for better security
        https.createServer(sslOptions, app).listen(port, () => {
            console.log(` International Payments API running on HTTPS port ${port}`);
            console.log(` SSL/TLS Encryption Enabled`);
            console.log(` Health check: https://localhost:${port}/health`);
            console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(` SSL: Development Certificates Active`);
        });
    } catch (error) {
        console.error(' SSL certificate error:', error.message);
        console.log(' Falling back to HTTP for development...');
        
        // Fallback to HTTP if SSL fails
        app.listen(port, () => {
            console.log(` International Payments API running on HTTP port ${port}`);
            console.log(` Development mode - No SSL`);
            console.log(` Health check: http://localhost:${port}/health`);
        });
    }
};

// Connecting to database and starting the server
connectToMongo()
    .then(() => {
        console.log('Database connected successfully');
        startServer();
    })
    .catch(err => {
        console.error('Failed to start server:', err);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

module.exports = app;