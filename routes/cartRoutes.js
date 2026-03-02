const express = require('express');
const router = express.Router();
// Importe spécifiquement les fonctions dont tu as besoin
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.delete('/remove/:productId', protect, removeFromCart);
router.delete('/', protect, clearCart);
module.exports = router;