const Wishlist = require('../models/Wishlist');
const cartController = require('./cartController');

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
        const { productId } = req.params;
        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist || !wishlist.products.includes(productId)) {
            return res.status(404).json({ message: "Produit non trouvé dans la wishlist" });
        }

        // On initialise req.body s'il n'existe pas pour éviter l'erreur "undefined"
        req.body = req.body || {}; 
        req.body.productId = productId;
        req.body.quantity = 1;

        // On appelle la logique d'ajout au panier
        await cartController.addToCart(req, res);

        // Si l'ajout au panier a réussi (la réponse n'a pas encore été envoyée), 
        // on retire de la wishlist
        wishlist.products.pull(productId);
        await wishlist.save();

    } catch (err) {
        // On vérifie si une réponse a déjà été envoyée par addToCart pour éviter les doubles headers
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
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