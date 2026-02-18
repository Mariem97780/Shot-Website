const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Créer une catégorie
exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Obtenir toutes les catégories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    NOUVEAU : Obtenir les produits d'une catégorie spécifique
exports.getProductsByCategory = async (req, res) => {
    try {
        // On cherche les produits qui ont l'ID de cette catégorie
        const products = await Product.find({ category: req.params.categoryId })
            .populate('images inventory');
        
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Supprimer une catégorie
exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Catégorie supprimée" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// @desc    Modifier une catégorie
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ success: false, message: "Catégorie non trouvée" });
        }

        res.status(200).json({ success: true, data: category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};