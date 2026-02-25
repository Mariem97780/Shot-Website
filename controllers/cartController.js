const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// Utilitaire pour recalculer le total du panier
const updateCartTotals = async (cartId) => {
    const items = await CartItem.find({ cart: cartId });
    const total = items.reduce((acc, item) => acc + item.subtotal, 0);
    await Cart.findByIdAndUpdate(cartId, { totalPrice: total, items: items.map(i => i._id) });
};

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        
        if (!product || product.stockQuantity < quantity) {
            return res.status(400).json({ message: "Stock insuffisant ou produit inexistant" });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) cart = await Cart.create({ user: req.user._id });

        let cartItem = await CartItem.findOne({ cart: cart._id, product: productId });

        if (cartItem) {
            cartItem.quantity += parseInt(quantity);
            cartItem.subtotal = cartItem.quantity * cartItem.unitPrice;
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
        res.status(500).json({ error: err.message });
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