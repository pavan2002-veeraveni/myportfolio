/**
 * Security & Performance Middleware
 * Configures helmet, rate limiting, CORS, and compression.
 */
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cors = require('cors');
const config = require('../config');

/**
 * General rate limiter for all routes
 */
const generalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
});

/**
 * Stricter rate limiter for AI-powered endpoints (chat, resume builder)
 */
const aiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.aiMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'AI request limit reached. Please wait before trying again.' },
});

/**
 * Apply all security and performance middleware to the app
 */
function applySecurityMiddleware(app) {
    // Helmet — security headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "blob:"],
                connectSrc: ["'self'", "https://api.groq.com"],
                upgradeInsecureRequests: [],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));

    // CORS
    app.use(cors({ origin: config.cors.origin }));

    // Gzip compression
    app.use(compression());

    // General rate limiter
    app.use(generalLimiter);
}

module.exports = { applySecurityMiddleware, aiLimiter };
