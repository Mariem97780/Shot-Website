const Product = require('../models/Product');
const ImageProduit = require('../models/ImageProduit');
const Inventaire = require('../models/Inventaire');
const APIFeatures = require('../utils/apiFeatures');

// --- ACTIONS ADMIN (Création, Modification, Suppression) ---

exports.createProduct = async (req, res) => {
    try {
        // 1. Créer le produit de base
        const product = await Product.create({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            // Utilise stockQuantity ou stock pour éviter les erreurs de saisie dans Postman
            stockQuantity: req.body.stockQuantity || req.body.stock || 0 
        });

        // 2. Gérer les images (Fichiers Multer OU Liens JSON)
        let savedImages = [];

        // Cas A : Images envoyées comme fichiers (form-data)
        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map(file => {
                return ImageProduit.create({
                    product: product._id,
                    url: file.path,
                    altText: product.name
                });
            });
            savedImages = await Promise.all(imagePromises);
        } 
        // Cas B : Images envoyées comme liens texte (JSON)
        else if (req.body.images && Array.isArray(req.body.images)) {
            const imagePromises = req.body.images.map(url => {
                return ImageProduit.create({
                    product: product._id,
                    url: url,
                    altText: product.name
                });
            });
            savedImages = await Promise.all(imagePromises);
        }

        // 3. Créer l'entrée inventaire
        const inventory = await Inventaire.create({
            product: product._id,
            stockActuel: req.body.stockQuantity || req.body.stock || 0
        });

        // 4. Lier les IDs (Images + Inventaire) au produit
        product.images = savedImages.map(img => img._id);
        product.inventory = inventory._id;
        await product.save();

        res.status(201).json({ 
            success: true, 
            message: "Produit complet créé avec images !", 
            data: product 
        });

    } catch (err) {
            console.log("DÉTAIL DE L'ERREUR :", JSON.stringify(err, null, 2));        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la création complète", 
            error: err.message // Évite le [object Object] dans Postman
        });
    }
}; // L'accolade qui manquait est ici !

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Produit non trouvé" });

        await Inventaire.findOneAndDelete({ product: product._id });
        await ImageProduit.deleteMany({ product: product._id });
        await product.deleteOne();

        res.status(200).json({ success: true, message: "Produit et données liées supprimés" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- ACTIONS CATALOGUE (Public) ---

exports.getProducts = async (req, res) => {
    try {
        const features = new APIFeatures(
            Product.find().populate('category images inventory'), 
            req.query
        )
        .search()
        .filter()
        .sort();

        const products = await features.query;

        res.status(200).json({ 
            success: true, 
            count: products.length, 
            data: products 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getSingleProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category images inventory');
        if (!product) return res.status(404).json({ message: "Produit non trouvé" });
        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};