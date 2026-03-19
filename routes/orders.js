const express = require('express');
const router = express.Router();
const { supabaseFetch } = require('../supabase');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize razorpay with test credentials if not in env
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyId',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestKeySecret'
});

// GET /api/orders/stats - Get revenue and popular data for dashboard
router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const orders = await supabaseFetch(`orders?select=*&created_at=gte.${today.toISOString()}`);

        let revenue = 0;
        orders.forEach(o => revenue += o.totalAmount || o.total_amount || 0);

        res.json({
            count: orders.length,
            revenue: revenue,
            popularDish: "Duck Confit Chettinad" // Example placeholder
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/orders/create-razorpay-order
router.post('/create-razorpay-order', async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: amount * 100, // amount in paisa
            currency: "INR",
            receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/orders/verify
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
        
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'YourTestKeySecret')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Signature is valid, save order
            const newOrderReq = await supabaseFetch('orders', {
                method: 'POST',
                body: JSON.stringify({
                    ...orderData,
                    paymentId: razorpay_payment_id
                })
            });
            const newOrder = newOrderReq[0];
            return res.status(200).json({ message: "Payment verified successfully", order: newOrder });
        } else {
            return res.status(400).json({ message: "Invalid signature sent!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/orders - Create online order
router.post('/', async (req, res) => {
    try {
        const newOrderReq = await supabaseFetch('orders', {
            method: 'POST',
            body: JSON.stringify(req.body)
        });
        const newOrder = newOrderReq[0];
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
