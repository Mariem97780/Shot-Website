const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middlewares/auth');

router.get('/', protect, async (req, res) => {
    const wishlist = await require('../models/Wishlist').findOne({ user: req.user._id }).populate('products');
    res.json(wishlist);
});
router.post('/add', protect, wishlistController.toggleWishlist);
router.post('/move-to-cart/:productId', protect, wishlistController.moveToCart);
router.delete('/clear', protect, wishlistController.clearWishlist);

module.exports = router;