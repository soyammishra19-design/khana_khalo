const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    address: { type: String, required: true },
    items: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 }
    }],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'preparing', enum: ['preparing', 'out_for_delivery', 'delivered'] },
    paymentId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
