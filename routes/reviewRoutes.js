const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');
const uploadCloud = require('../services/cloudinaryConfig');

// Note : On utilise 'reviewImages' pour correspondre à ton config Cloudinary
router.post('/:id', protect, uploadCloud.array('reviewImages', 3), reviewController.addReview);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;