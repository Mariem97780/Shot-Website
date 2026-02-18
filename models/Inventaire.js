const mongoose = require('mongoose');

const InventaireSchema = new mongoose.Schema({
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true, 
        unique: true 
    },
    stockActuel: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    seuilAlerte: { 
        type: Number, 
        default: 5 
    },
    derniereMiseAJour: { 
        type: Date, 
        default: Date.now // La date sera mise par défaut ici
    }
}, { timestamps: true });

// SUPPRESSION DU BLOC .pre('save') QUI CAUSAIT L'ERREUR

module.exports = mongoose.model('Inventaire', InventaireSchema);