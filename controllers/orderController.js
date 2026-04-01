const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Address = require('../models/Address');
const CartItem = require('../models/CartItem');
const Inventaire = require('../models/Inventaire');
const Coupon = require('../models/Coupon'); 
const User = require('../models/User');
const { getCurrencyInfo } = require('../utils/currencyConverter');
const mongoose = require('mongoose');

const { sendOrderConfirmation } = require('../services/emailService');
const { generateInvoicePDF } = require('../services/pdfService');

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

        const { addressId, methodePaiement, selectedCurrency } = req.body; 
        
        // 1. Récupérer le taux de change pour la devise choisie (ou IP par défaut)
        const conv = await getCurrencyInfo(req.ip, selectedCurrency);

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
        const finalTotalUSD = subTotal + shippingCost;

        // 2. Calculer le montant final dans la devise choisie
        const convertedTotal = (finalTotalUSD * conv.rate).toFixed(2);

        // 3. Créer la commande avec l'historique de devise
        const order = await Order.create({
            user: req.user._id,
            orderItems: orderItemsIds,
            adresseLivraison: addressId,
            subTotal: subTotal,
            fraisLivraison: shippingCost,
            total: finalTotalUSD, // On garde la base USD pour l'admin
            deviseCommande: {
                code: conv.code,
                symbole: conv.symbol,
                tauxApplique: conv.rate,
                montantConverti: convertedTotal
            },
            methodePaiement: methodePaiement || 'cash',
            numeroDeSuivi: `SHOT-${Date.now()}`,
            statut: (methodePaiement === 'card') ? 'pending' : 'cash'
        });

        await CartItem.deleteMany({ cart: cart._id });
        await Cart.findByIdAndUpdate(cart._id, { items: [], totalPrice: 0 });

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

// 3. STATISTIQUES
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

// 5. MES COMMANDES
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate({ path: 'orderItems', populate: { path: 'product', select: 'name images' } })
            .sort({ dateCommande: -1 });
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 6. DÉTAILS COMMANDE
exports.getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('adresseLivraison')
            .populate({ path: 'orderItems', populate: { path: 'product' } });
        if (!order || order.user.toString() !== req.user._id.toString())
            return res.status(404).json({ success: false, message: "Commande non trouvée." });
        res.status(200).json({ success: true, data: order });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 7. TOUTES LES COMMANDES (ADMIN)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'nom surname username email').sort({ dateCommande: -1 });
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 8. FACTURE PDF — FIX : populate 'surname' au lieu de 'prenom'
exports.downloadInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'nom surname username email') // ✅ CORRIGÉ : surname = prénom dans ta base MongoDB
            .populate('adresseLivraison')
            .populate({
                path: 'orderItems',
                populate: { path: 'product' }
            });

        console.log("DONNÉES USER RÉCUPÉRÉES :", order.user);

        if (!order) return res.status(404).json({ success: false, message: "Facture introuvable" });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=facture-${order._id}.pdf`);
        
        generateInvoicePDF(order, res);
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
};