const Product = require('../models/Product');
const ImageProduit = require('../models/ImageProduit');
const Inventaire = require('../models/Inventaire');
const Category = require('../models/Category');
const Avis = require('../models/Avis'); // Ajouté car le fichier existe
const PhotoAvis = require('../models/PhotoAvis'); // Ajouté car le fichier existe

// --- ACTIONS ADMIN (Création, Modification, Suppression) ---

exports.createProduct = async (req, res) => {
    try {
        // 1. Créer le produit de base
        const product = await Product.create({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            stockQuantity: req.body.stockQuantity
        });

        // 2. Gérer les images Cloudinary (si elles existent)
        let savedImages = [];
        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map(file => {
                return ImageProduit.create({
                    product: product._id,
                    url: file.path, // L'URL donnée par le middleware Cloudinary
                    altText: product.name
                });
            });
            savedImages = await Promise.all(imagePromises);
        }

        // 3. Créer l'entrée inventaire
        const inventory = await Inventaire.create({
            product: product._id,
            stockActuel: req.body.stockQuantity || 0
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
        res.status(500).json({ 
            message: "Erreur lors de la création complète", 
            error: err.message 
        });
    }
};

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
        let query;
        const reqQuery = { ...req.query };
        const removeFields = ['sort', 'page', 'limit', 'search'];
        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        query = Product.find(JSON.parse(queryStr)).populate('category images inventory');

        if (req.query.search) {
            query = query.find({ name: { $regex: req.query.search, $options: 'i' } });
        }

        const products = await query;
        res.status(200).json({ success: true, count: products.length, data: products });
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