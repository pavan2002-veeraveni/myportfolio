/**
 * Centralized Configuration Module
 * Validates required environment variables and exports typed config.
 */
require('dotenv').config();

const requiredVars = ['GROQ_API_KEY'];

const missingVars = requiredVars.filter(key => !process.env[key]);
if (missingVars.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('   AI features will not work. Please check your environment variables.');
    // Don't call process.exit() — it crashes serverless functions (Vercel)
}

module.exports = {
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: (process.env.NODE_ENV || 'development') === 'development',
    isProd: process.env.NODE_ENV === 'production',

    groq: {
        apiKey: process.env.GROQ_API_KEY,
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        chatMaxTokens: parseInt(process.env.GROQ_CHAT_MAX_TOKENS, 10) || 300,
        resumeMaxTokens: parseInt(process.env.GROQ_RESUME_MAX_TOKENS, 10) || 6000,
    },

    cors: {
        origin: process.env.CORS_ORIGIN || '*',
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
        aiMax: parseInt(process.env.RATE_LIMIT_AI_MAX, 10) || 10,
    },

    adminKey: process.env.ADMIN_KEY || 'dev-key-123', // Hard default for dev, must be set in prod
    allowedModels: [
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'mixtral-8x7b-32768'
    ],
};
