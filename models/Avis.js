const mongoose = require('mongoose');

const AvisSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    datePublication: { type: Date, default: Date.now },
    estVisible: { type: Boolean, default: true } // L'admin peut masquer un avis inapproprié
}, { timestamps: true });

module.exports = mongoose.model('Avis', AvisSchema);