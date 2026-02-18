const mongoose = require('mongoose');

const PhotoAvisSchema = new mongoose.Schema({
    avis: { type: mongoose.Schema.Types.ObjectId, ref: 'Avis', required: true },
    url: { type: String, required: true }
});

module.exports = mongoose.model('PhotoAvis', PhotoAvisSchema);