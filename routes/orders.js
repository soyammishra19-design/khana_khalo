const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET /api/orders/stats - Get revenue and popular data for dashboard
router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const orders = await Order.find({ createdAt: { $gte: today } });

        let revenue = 0;
        orders.forEach(o => revenue += o.totalAmount);

        res.json({
            count: orders.length,
            revenue: revenue,
            popularDish: "Duck Confit Chettinad" // Example placeholder
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/orders - Create online order
router.post('/', async (req, res) => {
    const order = new Order(req.body);
    try {
        const newOrder = await order.save();
        // In a real scenario, initiate Razorpay order here and return ID
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
