const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    stockQuantity: { type: Number, default: 0 },
    poids: String,
    dimensions: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ImageProduit' }],
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventaire' },
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);