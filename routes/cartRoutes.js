const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, cartController.getCart);
router.post('/add', protect, cartController.addToCart);
router.delete('/remove/:productId', protect, cartController.removeFromCart);

module.exports = router;