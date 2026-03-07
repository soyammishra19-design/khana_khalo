const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// GET /api/bookings - Get all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ date: 1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/bookings/today - Get today's bookings for dashboard
router.get('/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const bookings = await Booking.find({
            date: { $gte: today, $lt: tomorrow }
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/bookings - Create new booking
router.post('/', async (req, res) => {
    const booking = new Booking(req.body);
    try {
        const newBooking = await booking.save();

        const htmlContent = `
                            <div style="font-family: sans-serif; text-align: center;">
                                <h2>Your Table is Reserved!</h2>
                                <p>Hi ${newBooking.name}, thank you for booking with Éclat Bistro.</p>
                                <hr />
                                <p><strong>Date:</strong> ${new Date(newBooking.date).toLocaleDateString()}</p>
                                <p><strong>Time:</strong> ${newBooking.time}</p>
                                <p><strong>Guests:</strong> ${newBooking.partySize}</p>
                                <hr />
                                <p>We look forward to serving you!</p>
                            </div>
                        `;

        if (process.env.RESEND_API_KEY) {
            try {
                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
                    },
                    body: JSON.stringify({
                        from: 'Reservations <onboarding@resend.dev>', // Update with your verified sender later
                        to: [newBooking.email],
                        subject: 'Your Booking Confirmation - Éclat Bistro',
                        html: htmlContent
                    })
                });

                if (!response.ok) {
                    console.error('Failed to send email API response:', await response.text());
                } else {
                    console.log('Confirmation email sent to', newBooking.email);
                }
            } catch (apiError) {
                console.error('Error reaching email API:', apiError);
            }
        } else {
            console.log('No RESEND_API_KEY found in .env. Using Nodemailer Ethereal for testing...');
            try {
                const nodemailer = require('nodemailer');
                let testAccount = await nodemailer.createTestAccount();
                let transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass
                    }
                });

                let info = await transporter.sendMail({
                    from: '"Éclat Bistro" <reservations@eclatbistro.com>',
                    to: newBooking.email,
                    subject: "Your Booking Confirmation - Éclat Bistro",
                    html: htmlContent
                });

                console.log("Confirmation email sent to", newBooking.email);
                console.log("Preview your email here: %s", nodemailer.getTestMessageUrl(info));
                console.log("^ Click the link above to view your email test delivery ^");
            } catch (err) {
                console.error("Nodemailer error:", err);
            }
        }

        res.status(201).json(newBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH /api/bookings/:id - Update booking status
router.patch('/:id/status', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (booking == null) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (req.body.status != null) {
            booking.status = req.body.status;
        }
        const updatedBooking = await booking.save();
        res.json(updatedBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
