const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middlewares/auth');
const uploadCloud = require('../services/cloudinaryConfig');

// --- ROUTES PUBLIQUES ---
router.get('/', productController.getProducts);
router.get('/:id', productController.getSingleProduct);

// --- ROUTES ADMIN ---
router.post('/', protect, admin, uploadCloud.array('productImages', 5), productController.createProduct);
router.put('/:id', protect, admin, productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);

module.exports = router;