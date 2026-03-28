/**
 * Error Handling Middleware
 * Provides global error handler, 404 handler, and async wrapper utility.
 */
const config = require('../config');

/**
 * Wraps async route handlers to forward errors to Express error handler.
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }));
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * 404 handler — must be mounted AFTER all routes
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} does not exist`,
    });
}

/**
 * Global error handler — must be mounted LAST
 */
function globalErrorHandler(err, req, res, _next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${message}`);
    if (config.isDev) {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        error: message,
        ...(config.isDev && { stack: err.stack }),
    });
}

module.exports = { asyncHandler, notFoundHandler, globalErrorHandler };
