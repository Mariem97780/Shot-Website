const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
    try {
        const stats = {
            totalRevenue: await Order.aggregate([
                { $match: { statut: 'confirmed' } },
                { $group: { _id: null, total: { $sum: "$total" } } }
            ]),
            ordersCount: await Order.countDocuments(),
            productsCount: await Product.countDocuments(),
            usersCount: await User.countDocuments({ role: 'user' }),
            stockAlerts: await Product.find().populate('inventory').then(products => 
                products.filter(p => p.inventory && p.inventory.stockActuel <= p.inventory.seuilAlerte)
            )
        };
        res.status(200).json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};