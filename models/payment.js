const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    order: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Order', 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    method: { 
        type: String, 
        enum: ['card', 'cash'], // Correspond aux choix Card et Cash de ton Figma
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'refunded'], 
        default: 'pending' 
    },
    // Stocke l'ID renvoyé par Stripe (ex: pi_3N...)
    transactionId: { 
        type: String,
        required: function() { return this.method === 'card'; } 
    },
    paymentDate: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);