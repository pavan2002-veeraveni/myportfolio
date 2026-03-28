/**
 * Chat API Route
 * Proxies chat requests to Groq, keeping the API key server-side.
 */
const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const config = require('../config');
const { asyncHandler } = require('../middleware/error-handler');
const { aiLimiter } = require('../middleware/security');

const router = Router();

const validateChat = [
    body('messages').isArray({ min: 1 }).withMessage('Messages array is required'),
    body('messages.*.role').isIn(['system', 'user', 'assistant']).withMessage('Invalid message role'),
    body('messages.*.content').isString().notEmpty().withMessage('Message content is required'),
];

router.post('/', aiLimiter, validateChat, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid request', details: errors.array() });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.groq.apiKey}`,
        },
        body: JSON.stringify({
            model: config.groq.model, // Enforce server-side model
            messages: req.body.messages,
            max_tokens: Math.min(req.body.max_tokens || config.groq.chatMaxTokens, config.groq.chatMaxTokens),
            temperature: req.body.temperature || 0.7,
        }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error(`[GROQ] Chat API error ${response.status}:`, errorData);
        return res.status(response.status).json({ error: 'AI service error', details: errorData });
    }

    const data = await response.json();
    res.json(data);
}));

module.exports = router;
