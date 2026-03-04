const Wishlist = require('../models/Wishlist');
const cartController = require('./cartController');
const Cart = require('../models/Cart');

exports.toggleWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

        const productIndex = wishlist.products.indexOf(req.body.productId);
        if (productIndex > -1) {
            wishlist.products.splice(productIndex, 1); // Remove if exists
        } else {
            wishlist.products.push(req.body.productId); // Add if new
        }

        await wishlist.save();
        res.status(200).json({ success: true, data: wishlist });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.moveToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        // 1. Trouver la wishlist
        const wishlist = await Wishlist.findOne({ user: userId });
        
        // On vérifie si le produit est bien dans la wishlist
        if (!wishlist || !wishlist.products.includes(productId)) {
            return res.status(404).json({ success: false, message: "Produit inexistant dans la wishlist" });
        }

        // 2. Trouver ou Créer le Panier (Cart)
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // Si pas de panier, on en crée un avec le produit dans le tableau "items"
            cart = new Cart({ 
                user: userId, 
                items: [productId], // Ton modèle utilise "items"
                totalPrice: 0 // À calculer plus tard selon ta logique de prix
            });
        } else {
            // SÉCURITÉ : On vérifie si le produit est déjà dans "items"
            if (!cart.items) {
                cart.items = [];
            }

            const itemExists = cart.items.some(id => id.toString() === productId);

            if (!itemExists) {
                cart.items.push(productId);
            }
        }
        
        await cart.save(); 

        // 3. Supprimer de la wishlist SEULEMENT après le succès du panier
        wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
        await wishlist.save();

        res.json({ success: true, message: "Produit transféré au panier (items) avec succès !" });

    } catch (error) {
        console.error("Erreur MoveToCart:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors du transfert", 
            error: error.message 
        });
    }
};
exports.clearWishlist = async (req, res) => {
    try {
        await Wishlist.findOneAndUpdate(
            { user: req.user._id },
            { $set: { products: [] } }
        );
        res.status(200).json({ success: true, message: "Wishlist vidée avec succès" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};