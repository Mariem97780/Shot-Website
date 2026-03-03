const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    email: { type: String, required: true },
    sujet: { type: String, required: true },
    message: { type: String, required: true },
    dateEnvoi: { type: Date, default: Date.now },
    statut: { type: String, enum: ['non_lu', 'lu', 'traite'], default: 'non_lu' }
});

module.exports = mongoose.model('Contact', contactSchema);