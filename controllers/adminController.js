const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Avis = require('../models/Avis'); // Nom exact de ton fichier modèle
const Contact = require('../models/Contact');

// @desc    Statistiques globales du Dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = {
            // 1. REVENU
            totalRevenue: await Order.aggregate([
                { $match: { statut: { $in: ['confirmed', 'cash', 'delivered'] } } },
                { $group: { _id: null, total: { $sum: "$total" } } }
            ]),

            // 2. COMPTEURS
            ordersCount: await Order.countDocuments(),
            productsCount: await Product.countDocuments(),
            usersCount: await User.countDocuments({ role: 'user' }),

            // 3. ALERTES STOCK
            stockAlerts: await Product.find().populate('inventory').then(products => 
                products.filter(p => p.inventory && p.inventory.stockActuel <= p.inventory.seuilAlerte)
            ),

            // 4. ENGAGEMENT (Correction ici)
            customerEngagement: {
                avgRating: await Avis.aggregate([
                    { $group: { _id: null, avg: { $avg: "$rating" } } }
                ]).then(res => res[0] ? res[0].avg.toFixed(1) : 0),
                
                // On cherche 'non_lu' car c'est ce qui est dans ta base MongoDB
                unreadMessages: await Contact.countDocuments({ statut: 'non_lu' }) 
            }
        };

        res.status(200).json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Obtenir tous les messages de contact
exports.getMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort('-dateEnvoi');
        res.status(200).json({ success: true, count: messages.length, data: messages });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc    Mettre à jour le statut d'un message (ex: lu)
exports.updateMessageStatus = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: contact });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc    Liste de tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password').sort('-createdAt');
        res.status(200).json({ success: true, data: users });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc    Obtenir tous les avis pour modération
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Avis.find()
            .populate('user', 'nom surname email')
            .populate('product', 'name');
        res.status(200).json({ success: true, data: reviews });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};