const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/auth');

// 1. Routes Admin
router.get('/admin/all', protect, admin, orderController.getAllOrders);
router.put('/status/:id', protect, admin, orderController.updateStatus);

// 2. Routes Utilisateur
router.post('/create-from-cart', protect, orderController.createOrderFromCart);
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/stats', protect, orderController.getOrderStats); // Pour Figma
router.put('/cancel/:id', protect, orderController.cancelOrder); // Action annuler
router.get('/:id', protect, orderController.getOrderDetails); 
router.get('/invoice/:id', protect, orderController.downloadInvoice);

module.exports = router;