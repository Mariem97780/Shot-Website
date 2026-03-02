const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rue: { type: String, required: true },
    ville: { type: String, required: true },
    codePostal: { type: String, required: true },
    pays: { type: String, default: 'Tunisia' },
    telephone: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);