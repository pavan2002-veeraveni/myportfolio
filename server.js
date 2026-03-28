/**
 * ═══════════════════════════════════════════════
 *   Pavan Kumar Portfolio — Enterprise Server
 * ═══════════════════════════════════════════════
 *
 * Production-ready Node.js/Express server with:
 * - Modular route architecture
 * - Security hardening (helmet, rate limiting)
 * - Gzip compression
 * - Structured logging
 * - Graceful shutdown
 */
const config = require('./config');
const express = require('express');
const morgan = require('morgan');
const path = require('path');

const { applySecurityMiddleware } = require('./middleware/security');
const { notFoundHandler, globalErrorHandler } = require('./middleware/error-handler');

const chatRouter = require('./routes/chat');
const resumeRouter = require('./routes/resume');
const uploadRouter = require('./routes/upload');
const contactRouter = require('./routes/contact');

// ─── App Setup ───
const app = express();

// Trust reverse proxy (Render, Railway, etc.) for correct client IP in rate limiting
app.set('trust proxy', 1);

// Security & performance middleware
applySecurityMiddleware(app);

// Request logging
app.use(morgan(config.isDev ? 'dev' : 'combined'));

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname), {
    maxAge: config.isProd ? '1d' : 0,
    etag: true,
}));

// ─── Routes ───
app.use('/upload', uploadRouter);
app.use('/api/chat', chatRouter);
app.use('/api/tailor-resume', resumeRouter);
app.use('/api/contact', contactRouter);

// ─── Error Handling ───
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ─── Server Start ───
const server = app.listen(config.port, () => {
    console.log(`\n═══════════════════════════════════════════════`);
    console.log(`  🚀 Portfolio Server — ${config.nodeEnv.toUpperCase()}`);
    console.log(`═══════════════════════════════════════════════`);
    console.log(`  🌐 http://localhost:${config.port}`);
    console.log(`  📸 Upload:   http://localhost:${config.port}/upload`);
    console.log(`  📝 Resume:   http://localhost:${config.port}/#resume-builder`);
    console.log(`  💬 Chat API: http://localhost:${config.port}/api/chat`);
    console.log(`═══════════════════════════════════════════════\n`);
});

// ─── Graceful Shutdown ───
function shutdown(signal) {
    console.log(`\n⚡ ${signal} received. Shutting down gracefully...`);
    server.close(() => {
        console.log('✅ Server closed. Goodbye!\n');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
    }, 5000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
