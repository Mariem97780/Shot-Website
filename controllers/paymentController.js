const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const { sendOrderConfirmation } = require('../services/emailService');

exports.createPaymentIntent = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        
        if (!order) return res.status(404).json({ message: "Commande non trouvée" });

        // --- CONVERSION DE DEVISE (Version Propre) ---
        // On garde le taux de 0.32 car le TND n'est pas supporté par Stripe
        const TND_TO_USD = 0.32; 
        const amountInUsdCents = Math.round((order.total * TND_TO_USD) * 100); 

        // 1. Création de l'intention chez Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInUsdCents, 
            currency: 'usd',
            metadata: { 
                orderId: order._id.toString(),
                originalAmountTND: order.total.toString() 
            }
        });

        // 2. Sauvegarde du paiement dans ta base MongoDB
        await Payment.create({
            order: order._id,
            user: order.user, 
            transactionId: paymentIntent.id, 
            amount: order.total, // On stocke la valeur en DT pour ta comptabilité
            status: 'pending',
            method: 'card'
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error("Erreur CreateIntent:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.confirmPaymentStatus = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        
        // Nettoyage de l'ID (au cas où tu colles le secret entier)
        const cleanId = paymentIntentId.split('_secret')[0];

        const payment = await Payment.findOne({ transactionId: cleanId });
        
        if (!payment) {
            return res.status(404).json({ 
                success: false, 
                message: "Paiement introuvable (Vérifiez l'ID pi_...)" 
            });
        }

        payment.status = 'completed';
        await payment.save();

        const order = await Order.findByIdAndUpdate(
            payment.order, 
            { 
                statut: 'confirmed',
                isPaid: true,
                paidAt: Date.now(),
                payment: payment._id 
            }, 
            { new: true }
        ).populate('user adresseLivraison');

        // Envoi de l'email
        try {
            const items = await OrderItem.find({ _id: { $in: order.orderItems } }).populate('product');
            const itemsHtml = items.map(i => `<li>${i.product.name} x${i.quantity}</li>`).join('');

            await sendOrderConfirmation(order.user.email, {
                _id: order._id,
                numeroDeSuivi: order.numeroDeSuivi || "SHOT-TEMP",
                statut: "Confirmée (Payée)",
                total: order.total,
                itemsList: `<ul>${itemsHtml}</ul>`,
                address: order.adresseLivraison ? `${order.adresseLivraison.rue}, ${order.adresseLivraison.ville}` : "Adresse par défaut"
            });
        } catch (mailErr) { 
            console.error("Erreur Mail:", mailErr.message); 
        }

        res.status(200).json({ success: true, message: "Paiement confirmé !" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};