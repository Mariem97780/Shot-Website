const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem'); // Ne pas oublier cet import
const { sendOrderConfirmation } = require('../services/emailService');

exports.createPaymentIntent = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Commande non trouvée" });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.total * 100),
            currency: 'usd',
            metadata: { orderId: order._id.toString() }
        });

        const payment = await Payment.create({
            user: req.user._id,
            order: order._id,
            amount: order.total,
            method: 'card',
            transactionId: paymentIntent.id,
            status: 'pending'
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentId: payment._id
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.confirmPaymentStatus = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        
        const payment = await Payment.findOne({ transactionId: paymentIntentId });
        if (!payment) return res.status(404).json({ success: false, message: "Paiement introuvable" });

        payment.status = 'completed';
        await payment.save();

        // On met à jour la commande et on RÉCUPÈRE les détails (populate)
        const order = await Order.findByIdAndUpdate(payment.order, { 
            statut: 'confirmed',
            payment: payment._id 
        }, { new: true }).populate('user adresseLivraison');

        // On prépare les articles pour l'email
        try {
            const items = await OrderItem.find({ _id: { $in: order.orderItems } }).populate('product');
            const itemsHtml = items.map(i => `<li>${i.product.name} x${i.quantity}</li>`).join('');

            // ENVOI DE L'EMAIL AVEC LE NUMÉRO DE SUIVI
            await sendOrderConfirmation(order.user.email, {
                _id: order._id,
                numeroDeSuivi: order.numeroDeSuivi, // 👈 Important
                statut: "Confirmée (Payée par Carte)",
                total: order.total,
                itemsList: `<ul>${itemsHtml}</ul>`,
                address: `${order.adresseLivraison.rue}, ${order.adresseLivraison.ville}`
            });
        } catch (mailErr) { 
            console.error("Erreur envoi mail:", mailErr.message); 
        }

        res.status(200).json({ success: true, message: "Paiement confirmé et email envoyé !" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};