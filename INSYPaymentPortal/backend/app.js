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
const employeeRoutes = require('./routes/employeeRoutes.js');
const employeePaymentRoutes = require('./routes/employeePaymentRoutes.js');

const app = express();

// Security & CORS handled globally
securityMiddlewares(app);

// Body parsing middleware with limits and validation
app.use(express.json({
    limit: '10kb',
    verify: (req, res, buf) => {
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
    parameterLimit: 10
}));

// Enhanced logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const userAgent = req.get('User-Agent') || 'Unknown';

    console.log(`🔐 ${timestamp} - ${req.method} ${req.url} - IP: ${req.ip} - UA: ${userAgent.substring(0, 50)}`);

    if (req.path.includes('/auth/') || req.path.includes('/payments')) {
        console.log(`Security Event: ${req.method} ${req.path} - IP: ${req.ip}`);
    }

    next();
});

// Health check endpoint with security headers
app.get('/health', (req, res) => {
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

// API routes
app.use('/v1/test', testRoutes);
app.use('/v1/payments', paymentRoutes);
app.use('/v1/auth', authRoutes);
app.use('/v1/employee', employeeRoutes);
app.use('/v1/employee/payments', employeePaymentRoutes);

// Caching headers for sensitive routes
app.use('/v1/auth', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});

app.use('/v1/payments', (req, res, next) => {
    if (req.method === 'GET') {
        res.setHeader('Cache-Control', 'private, no-cache, max-age=300');
    } else {
        res.setHeader('Cache-Control', 'no-store, no-cache');
    }
    next();
});

// 404 handler with security headers
app.use('*', (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ success: false, errors, type: 'VALIDATION_ERROR' });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({ success: false, error: `${field} already exists`, type: 'DUPLICATE_ERROR' });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, error: 'Invalid token', type: 'AUTH_ERROR' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Token expired', type: 'AUTH_ERROR' });
    }

    if (err.message.includes('Invalid JSON') || err.message.includes('Unexpected token')) {
        return res.status(400).json({ success: false, error: 'Invalid request payload', type: 'SECURITY_ERROR' });
    }

    const errorResponse = { success: false, error: 'Internal server error', type: 'SERVER_ERROR' };
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.details = err.message;
        errorResponse.stack = err.stack;
    }
    res.status(500).json(errorResponse);
});

// Server & SSL configuration
const port = process.env.API_PORT || 3000;
const startServer = () => {
    try {
        // Multiple SSL certificate paths
        const sslKeyPaths = [
            path.join(__dirname, 'ssl/localhost-key.pem'),
            path.join(__dirname, 'localhost+2-key.pem'),
            path.join(__dirname, 'certs/key.pem'),
        ];
        const sslCertPaths = [
            path.join(__dirname, 'ssl/localhost.pem'),
            path.join(__dirname, 'localhost+2.pem'),
            path.join(__dirname, 'certs/cert.pem'),
        ];

        let keyPath, certPath;

        for (const p of sslKeyPaths) {
            if (fs.existsSync(p)) { keyPath = p; console.log(`✅ Found SSL key: ${p}`); break; }
        }
        for (const p of sslCertPaths) {
            if (fs.existsSync(p)) { certPath = p; console.log(`✅ Found SSL cert: ${p}`); break; }
        }

        if (keyPath && certPath) {
            const sslOptions = {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath),
                secureProtocol: 'TLSv1_2_method',
                ciphers: [
                    'ECDHE-RSA-AES128-GCM-SHA256',
                    'ECDHE-RSA-AES256-GCM-SHA384',
                    'ECDHE-RSA-AES128-SHA256',
                    'ECDHE-RSA-AES256-SHA384'
                ].join(':'),
                honorCipherOrder: true
            };

            https.createServer(sslOptions, app).listen(port, () => {
                console.log(`🌐 API running on HTTPS port ${port}`);
                console.log(`🔒 SSL Enabled: ${certPath}`);
                console.log(`🏥 Health check: https://localhost:${port}/health`);
                console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
            });
        } else {
            console.log('🔐 No SSL certs found, using self-signed...');

            const selfSignedOptions = {
                key: fs.readFileSync(path.join(__dirname, 'ssl/localhost-key.pem')),
                cert: fs.readFileSync(path.join(__dirname, 'ssl/localhost.pem')),
                secureProtocol: 'TLSv1_2_method',
                ciphers: [
                    'ECDHE-RSA-AES128-GCM-SHA256',
                    'ECDHE-RSA-AES256-GCM-SHA384',
                    'ECDHE-RSA-AES128-SHA256',
                    'ECDHE-RSA-AES256-SHA384'
                ].join(':'),
                honorCipherOrder: true
            };

            https.createServer(selfSignedOptions, app).listen(port, () => {
                console.log(`🌐 API running on HTTPS port ${port} (Self-Signed)`);
                console.log(`🏥 Health check: https://localhost:${port}/health`);
            });
        }
    } catch (error) {
        console.error('❌ SSL error:', error.message);
        console.log('🔄 Falling back to HTTP...');
        app.listen(port, () => {
            console.log(`🌐 API running on HTTP port ${port}`);
            console.log(`🏥 Health check: http://localhost:${port}/health`);
        });
    }
};

// Connect DB and start server
connectToMongo()
    .then(() => {
        console.log('✅ Database connected');
        startServer();
    })
    .catch(err => {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGTERM', () => { console.log('SIGTERM received, shutting down...'); process.exit(0); });
process.on('SIGINT', () => { console.log('SIGINT received, shutting down...'); process.exit(0); });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    if (process.env.NODE_ENV === 'production') process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    if (process.env.NODE_ENV === 'production') process.exit(1);
});

module.exports = app;
