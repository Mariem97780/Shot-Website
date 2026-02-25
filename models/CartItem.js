const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('CartItem', cartItemSchema);