const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Address = require('../models/Address');
const CartItem = require('../models/CartItem');
const Inventaire = require('../models/Inventaire');
const Coupon = require('../models/Coupon'); 
const User = require('../models/User'); // AJOUTÉ : Pour que l'envoi de mail marche
const mongoose = require('mongoose');

const { sendOrderConfirmation } = require('../services/emailService');
const { generateInvoicePDF } = require('../services/pdfservice');

// 1. CRÉATION DE COMMANDE
exports.createOrderFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate({
            path: 'items',
            populate: { path: 'product' }
        });

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Votre panier est vide." });
        }

        const { addressId, methodePaiement } = req.body; 
        const address = await Address.findById(addressId);
        if (!address) return res.status(400).json({ success: false, message: "Adresse introuvable." });

        const orderItemsIds = [];
        let itemsHtml = "";

        for (const item of cart.items) {
            const orderItem = await OrderItem.create({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            });
            orderItemsIds.push(orderItem._id);
            itemsHtml += `<li>${item.product.name} x${item.quantity}</li>`;
        }

        const subTotal = cart.totalPrice;
        const shippingCost = 7;
        const finalTotal = subTotal + shippingCost;

        const order = await Order.create({
            user: req.user._id,
            orderItems: orderItemsIds,
            adresseLivraison: addressId,
            subTotal: subTotal,
            fraisLivraison: shippingCost,
            total: finalTotal,
            methodePaiement: methodePaiement || 'cash',
            numeroDeSuivi: `SHOT-${Date.now()}`,
            statut: 'pending',
            dateCommande: new Date()
        });

        await CartItem.deleteMany({ cart: cart._id });
        await Cart.findByIdAndUpdate(cart._id, { items: [], totalPrice: 0 });

        if (order.methodePaiement === 'cash') {
            try {
                const user = await User.findById(req.user._id);
                if (user) {
                    await sendOrderConfirmation(user.email, {
                        _id: order._id,
                        subTotal: order.subTotal,
                        total: order.total,
                        tax: 0,
                        itemsHtml: itemsHtml
                    });
                    console.log("✅ Mail envoyé avec succès");
                }
            } catch (err) { 
                console.error("❌ Erreur Mail:", err.message); 
            }
        }

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. CHANGER LE STATUT (ADMIN)
exports.updateStatus = async (req, res) => {
    try {
        const { statut } = req.body;
        const order = await Order.findById(req.params.id).populate('orderItems');

        if (!order) return res.status(404).json({ success: false, message: "Commande non trouvée" });

        if (statut === 'cancelled' && order.statut !== 'cancelled') {
            for (const item of order.orderItems) {
                const inv = await Inventaire.findOneAndUpdate(
                    { product: item.product },
                    { $inc: { stockActuel: item.quantity } },
                    { new: true }
                );
                await Product.findByIdAndUpdate(item.product, { stockQuantity: inv.stockActuel });
            }
        }

        order.statut = statut;
        await order.save();
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 3. STATISTIQUES (SANS CONFIRMED !)
exports.getOrderStats = async (req, res) => {
    try {
        const stats = await Order.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
            { $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                delivered: { $sum: { $cond: [{ $eq: ["$statut", "delivered"] }, 1, 0] } },
                pending: { $sum: { $cond: [{ $eq: ["$statut", "pending"] }, 1, 0] } },
                cancelled: { $sum: { $cond: [{ $eq: ["$statut", "cancelled"] }, 1, 0] } }
            }}
        ]);

        const result = stats[0] || { totalOrders: 0, delivered: 0, pending: 0, cancelled: 0 };
        
        // On s'assure que "confirmed" n'existe absolument pas dans la réponse
        delete result.confirmed;

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. ANNULER COMMANDE (USER)
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('orderItems');
        if (!order) return res.status(404).json({ success: false, message: "Commande non trouvée." });
        
        if (order.statut !== 'pending') {
            return res.status(400).json({ success: false, message: "Seules les commandes en attente peuvent être annulées." });
        }

        for (const item of order.orderItems) {
            const inv = await Inventaire.findOneAndUpdate(
                { product: item.product },
                { $inc: { stockActuel: item.quantity } },
                { new: true }
            );
            await Product.findByIdAndUpdate(item.product, { stockQuantity: inv.stockActuel });
        }

        order.statut = 'cancelled';
        await order.save();
        res.status(200).json({ success: true, message: "Commande annulée." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. AUTRES FONCTIONS (DETAILS, LISTE, FACTURE)
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate({ path: 'orderItems', populate: { path: 'product', select: 'name images' } })
            .sort({ dateCommande: -1 });
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('adresseLivraison').populate({ path: 'orderItems', populate: { path: 'product' } });
        if (!order || order.user.toString() !== req.user._id.toString()) return res.status(404).json({ success: false, message: "Commande non trouvée." });
        res.status(200).json({ success: true, data: order });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'nom prenom email').sort({ dateCommande: -1 });
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.downloadInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('adresseLivraison').populate({ path: 'orderItems', populate: { path: 'product' } });
        if (!order) return res.status(404).json({ success: false, message: "Facture introuvable" });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=facture-${order._id}.pdf`);
        generateInvoicePDF(order, res);
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};