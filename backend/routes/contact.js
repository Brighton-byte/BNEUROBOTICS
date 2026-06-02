const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

// Rate limiter for contact form
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 requests per windowMs
    message: 'Too many contact form submissions, please try again later.'
});

// Email transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Validation rules
const contactValidation = [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
    body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
];

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', contactLimiter, contactValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, subject, message, phone } = req.body;

        // Email to admin
        const adminMailOptions = {
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER,
            subject: `Contact Form: ${subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><small>Sent from BNeurobotics website</small></p>
            `
        };

        // Confirmation email to user
        const userMailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Thank you for contacting BNeurobotics',
            html: `
                <h2>Thank you for reaching out!</h2>
                <p>Hi ${name},</p>
                <p>We have received your message and will get back to you as soon as possible.</p>
                <p><strong>Your message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <br>
                <p>Best regards,</p>
                <p>BNeurobotics Team</p>
                <hr>
                <p><small>This is an automated email. Please do not reply.</small></p>
            `
        };

        // Send emails
        await transporter.sendMail(adminMailOptions);
        await transporter.sendMail(userMailOptions);

        // Save to database (optional - create Contact model if needed)
        // await Contact.create({ name, email, subject, message, phone });

        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully. We will contact you soon!'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
});

// @route   POST /api/contact/newsletter
// @desc    Subscribe to newsletter
// @access  Public
router.post('/newsletter', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email } = req.body;

        // Save to newsletter subscribers (create NewsletterSubscriber model)
        // await NewsletterSubscriber.create({ email });

        // Send welcome email
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Welcome to BNeurobotics Newsletter',
            html: `
                <h2>Welcome to BNeurobotics!</h2>
                <p>Thank you for subscribing to our newsletter.</p>
                <p>You'll receive updates about:</p>
                <ul>
                    <li>New products and innovations</li>
                    <li>Educational courses and workshops</li>
                    <li>Industry news and insights</li>
                    <li>Special offers and discounts</li>
                </ul>
                <p>Stay tuned!</p>
                <br>
                <p>Best regards,</p>
                <p>BNeurobotics Team</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Successfully subscribed to newsletter!'
        });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe. Please try again later.'
        });
    }
});

module.exports = router;
