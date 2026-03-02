const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const Inventaire = require('../models/Inventaire');

const updateCartTotals = async (cartId) => {
    const items = await CartItem.find({ cart: cartId });
    const total = items.reduce((acc, item) => acc + item.subtotal, 0);
    await Cart.findByIdAndUpdate(cartId, { totalPrice: total, items: items.map(i => i._id) });
};

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        // 1. Récupérer les deux documents
        const product = await Product.findById(productId);
        const inventaire = await Inventaire.findOne({ product: productId });

        // 2. Vérification de sécurité
        if (!product) {
            return res.status(404).json({ success: false, message: "Produit inexistant" });
        }

        if (!inventaire || inventaire.stockActuel < quantity) {
            return res.status(400).json({ 
                success: false, 
                message: `Stock insuffisant dans l'inventaire. Dispo: ${inventaire ? inventaire.stockActuel : 0}` 
            });
        }

        // 3. Gestion du panier (le reste de ton code...)
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) cart = await Cart.create({ user: req.user._id });

        let cartItem = await CartItem.findOne({ cart: cart._id, product: productId });

        if (cartItem) {
            cartItem.quantity += parseInt(quantity);
            cartItem.subtotal = cartItem.quantity * product.price; // Utilise product.price ici
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({
                cart: cart._id,
                product: productId,
                quantity,
                unitPrice: product.price,
                subtotal: product.price * quantity
            });
        }

        await updateCartTotals(cart._id);
        const updatedCart = await Cart.findById(cart._id).populate({
            path: 'items',
            populate: { path: 'product', select: 'name price images' }
        });

        res.status(200).json({ success: true, data: updatedCart });

    } catch (err) {
        console.error("Erreur détaillée:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate({
            path: 'items',
            populate: { path: 'product', select: 'name price images' }
        });
        res.status(200).json({ success: true, data: cart || { items: [], totalPrice: 0 } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        await CartItem.findOneAndDelete({ cart: cart._id, product: req.params.productId });
        await updateCartTotals(cart._id);
        res.status(200).json({ success: true, message: "Produit retiré" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            await CartItem.deleteMany({ cart: cart._id });
            await Cart.findByIdAndDelete(cart._id);
        }
        res.status(200).json({ success: true, message: "Panier vidé" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};