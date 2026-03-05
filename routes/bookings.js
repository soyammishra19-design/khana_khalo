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
