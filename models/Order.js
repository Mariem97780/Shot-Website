const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem', required: true }],
    adresseLivraison: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    subTotal: { type: Number, required: true },
    fraisLivraison: { type: Number, default: 7 },
    total: { type: Number, required: true },
    
    // --- NOUVEAUX CHAMPS POUR MULTI-DEVISES (G2A STYLE) ---
    deviseCommande: { 
        code: { type: String, default: 'TND' }, 
        symbole: { type: String, default: 'DT' }, 
        tauxApplique: { type: Number, default: 1 }, 
        montantConverti: { type: Number } 
    },

    statut: { 
        type: String, 
        enum: ['pending', 'confirmed', 'delivered', 'cancelled', 'cash'], 
        default: 'pending' 
    },
    methodePaiement: { 
        type: String, 
        enum: ['cash', 'card'], 
        required: true 
    },
    numeroDeSuivi: { type: String },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    dateCommande: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);