/**
 * Contact API Route
 * Handles contact form submissions and sends email via Nodemailer.
 */
const express = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const router = express.Router();

// ─── HTML Sanitizer ───
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ─── Transporter (created once at module level) ───
let transporter = null;
function getTransporter() {
    if (!transporter && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    return transporter;
}

// ─── Validation ───
const validateContact = [
    body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
    body('subject').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Subject is required'),
    body('message').isString().trim().isLength({ min: 1, max: 5000 }).withMessage('Message is required'),
];

router.post('/', validateContact, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { name, email, subject, message } = req.body;

        const mailer = getTransporter();
        if (!mailer) {
            console.warn('EMAIL_USER or EMAIL_PASS not set in .env. Cannot send email.');
            return res.status(500).json({ error: 'Server email misconfiguration' });
        }

        // Sanitize all user input before inserting into HTML
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeSubject = escapeHtml(subject);
        const safeMessage = escapeHtml(message);

        const mailOptions = {
            from: `"${safeName}" <${process.env.EMAIL_USER}>`,
            replyTo: email,
            to: process.env.EMAIL_USER,
            subject: `Portfolio Contact: ${safeSubject}`,
            text: `You have received a new message from your portfolio website.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <h3>New Contact Message from Portfolio</h3>
                <p><strong>Name:</strong> ${safeName}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Subject:</strong> ${safeSubject}</p>
                <h4>Message:</h4>
                <p>${safeMessage.replace(/\n/g, '<br>')}</p>
            `,
        };

        await mailer.sendMail(mailOptions);

        console.log(`Email successfully sent from ${name} (${email})`);
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
});

module.exports = router;
