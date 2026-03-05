const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    partySize: { type: Number, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    requests: { type: String },
    occasion: { type: String },
    status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled', 'completed'] }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
