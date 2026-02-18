const mongoose = require('mongoose');

const ImageProduitSchema = new mongoose.Schema({
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true 
    },
    url: { 
        type: String, 
        required: true 
    },
    altText: { 
        type: String, 
        default: "Product image" 
    }
}, { timestamps: true });

module.exports = mongoose.model('ImageProduit', ImageProduitSchema);