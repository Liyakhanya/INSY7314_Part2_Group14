const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');

// Enhanced rate limiting for the banking application
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: 'Too many payment requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Brute force protection for sensitive endpoints
const sensitiveLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        error: 'Too many attempts. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ✅ FIXED: Brute force protection - removed custom keyGenerator
const bruteForceLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        error: 'Too many failed attempts. Please try again later.'
    },
    skipSuccessfulRequests: true,
    // ✅ REMOVED: Problematic keyGenerator that caused IPv6 issues
    standardHeaders: true,
    legacyHeaders: false,
});

// ✅ UPDATED CORS CONFIGURATION - Added HTTP origins for employee portal
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || 'https://localhost:5173',
        process.env.FRONTEND_URL_EMPLOYEE || 'https://localhost:3002',
        'https://localhost:3002',
        'https://localhost:5173',
        'http://localhost:3002',  // ✅ ADDED: HTTP employee portal
        'http://localhost:5173'   // ✅ ADDED: HTTP main frontend
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Content-Type-Options'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
};

// Enhanced Security headers configuration
const helmetConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"], 
            styleSrc: ["'self'", "https://fonts.googleapis.com"], 
            imgSrc: ["'self'", "data:", "https:"],
            // ✅ UPDATED connectSrc - Added HTTP origins
            connectSrc: [
                "'self'", 
                process.env.FRONTEND_URL || 'https://localhost:5173',
                process.env.FRONTEND_URL_EMPLOYEE || 'https://localhost:3002',
                'http://localhost:3002',  // ✅ ADDED: HTTP employee portal
                'http://localhost:5173'   // ✅ ADDED: HTTP main frontend
            ],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
        }
    },
    frameguard: { 
        action: 'deny' 
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    hidePoweredBy: true,
    ieNoOpen: true,
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { 
        policy: 'strict-origin-when-cross-origin' 
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { 
        policy: "same-site" 
    }
};

// Environment validation for required security variables
const validateEnvironment = () => {
    const requiredEnvVars = ['JWT_SECRET', 'CONN_STRING'];
    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:', missingVars.join(', '));
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

const securityMiddlewares = (app) => {
    validateEnvironment();

    // Applying security middleware in the correct order
    
    // Helmet security headers (FIRST)
    app.use(helmet(helmetConfig));

    // ✅ UPDATED CORS for cross-origin requests - Now allows both HTTP and HTTPS
    app.use(cors(corsOptions));

    // Data sanitization against NoSQL injection
    app.use(mongoSanitize({
        replaceWith: '_',
        onSanitize: ({ req, key }) => {
            console.warn(`🚨 NoSQL injection attempt detected:`, {
                ip: req.ip,
                key: key,
                url: req.originalUrl,
                timestamp: new Date().toISOString(),
                userAgent: req.get('User-Agent')
            });
        }
    }));

    // Data sanitization against XSS
    app.use(xss());

    // Protection against HTTP Parameter Pollution
    app.use(hpp({
        whitelist: [
            'amount', 
            'currency', 
            'reference'
        ]
    }));

    // Enhanced cache control for ALL authenticated requests
    app.use((req, res, next) => {
        if (req.headers.authorization || req.path.startsWith('/v1/auth') || req.path.startsWith('/v1/payments')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('Surrogate-Control', 'no-store');
        } else if (req.method === 'GET') {
            res.setHeader('Cache-Control', 'public, max-age=300');
        }
        next();
    });

    // General rate limiting
    app.use(generalLimiter);

    // Applying specific rate limiters to routes
    app.use('/v1/auth/login', authLimiter);
    app.use('/v1/auth/login', bruteForceLimiter);
    app.use('/v1/auth/register', authLimiter);
    app.use('/v1/payments', paymentLimiter);
    
    // ✅ ADDED: Employee login rate limiting
    app.use('/v1/employee/login', authLimiter);
    app.use('/v1/employee/login', bruteForceLimiter);
    
    // Extra protection for sensitive endpoints
    app.use('/v1/auth/reset-password', sensitiveLimiter);
    app.use('/v1/auth/change-password', sensitiveLimiter);

    // Comprehensive security headers for ALL responses
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 
            'camera=(), microphone=(), geolocation=(), payment=(), fullscreen=()'
        );
        res.setHeader('X-DNS-Prefetch-Control', 'off');
        next();
    });

    // Consistent X-Frame-Options for ALL responses 
    app.use((req, res, next) => {
        res.setHeader('X-Frame-Options', 'DENY');
        next();
    });

    // Enhancing security event logging
    app.use((req, res, next) => {
        const securityRelevantEndpoints = [
            '/v1/auth/login', 
            '/v1/auth/register', 
            '/v1/auth/reset-password',
            '/v1/auth/change-password',
            '/v1/payments',
            '/v1/employee/login'  // ✅ ADDED: Employee login
        ];
        
        if (securityRelevantEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
            const logData = {
                event: 'SECURITY_REQUEST',
                method: req.method,
                path: req.path,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString(),
                contentType: req.get('Content-Type')
            };

            if (req.body?.password) {
                logData.hasPassword = true;
            }
            if (req.body?.amount) {
                logData.hasPayment = true;
            }
            if (req.body?.email) {
                logData.hasEmail = true;
            }
            if (req.body?.username) {
                logData.hasUsername = true;
            }

            console.log('🔒 Security Event:', logData);
        }
        next();
    });

    // Requesting size validation middleware
    app.use((req, res, next) => {
        const contentLength = parseInt(req.get('Content-Length') || '0');
        const maxSize = 10 * 1024;
        
        if (contentLength > maxSize) {
            return res.status(413).json({
                success: false,
                error: 'Request payload too large',
                maxAllowed: `${maxSize} bytes`
            });
        }
        next();
    });

    // HTTP method validation
    app.use((req, res, next) => {
        const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
        if (!allowedMethods.includes(req.method)) {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed',
                allowedMethods: allowedMethods
            });
        }
        next();
    });
};

// Enhanced Security utility functions
const securityUtils = {
    sanitizeInput: (input) => {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/on\w+=/gi, '')
            .replace(/expression\(/gi, '')
            .replace(/url\(/gi, '')
            .replace(/<\?php/gi, '')
            .replace(/\<\?/gi, '')
            .trim();
    },
    
    detectSQLInjection: (input) => {
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE|TRUNCATE|MERGE|CALL)\b)/i,
            /('|"|;|--|\/\*|\*\/|@@|@|char|nchar|varchar|nvarchar|exec|sp_)/i,
            /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
            /(UNION\s+SELECT)/i,
            /(WAITFOR\s+DELAY)/i
        ];
        
        return sqlPatterns.some(pattern => pattern.test(input));
    },

    detectXSS: (input) => {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /expression\(/gi,
            /vbscript:/gi
        ];
        
        return xssPatterns.some(pattern => pattern.test(input));
    },
    
    validateFileUpload: (file) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf'
        ];
        
        const maxFileSize = 5 * 1024 * 1024;
        
        return allowedMimeTypes.includes(file.mimetype) && file.size <= maxFileSize;
    },

    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    generateSecureRandom: (length = 32) => {
        const crypto = require('crypto');
        return crypto.randomBytes(length).toString('hex');
    },

    validatePasswordStrength: (password) => {
        const minLength = 12;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password);
        
        return password.length >= minLength && 
               hasUpperCase && 
               hasLowerCase && 
               hasNumbers && 
               hasSpecialChar;
    }
};

module.exports = { 
    securityMiddlewares, 
    authLimiter, 
    paymentLimiter, 
    sensitiveLimiter,
    bruteForceLimiter,
    securityUtils,
    validateEnvironment
};