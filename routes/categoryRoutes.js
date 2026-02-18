const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, admin } = require('../middlewares/auth');


// Ce log va nous dire si le contrôleur est bien chargé au démarrage
console.log("Contrôleur chargé :", categoryController.createCategory ? "OUI" : "NON");

router.post('/', categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:categoryId/products', categoryController.getProductsByCategory);
router.delete('/:id', categoryController.deleteCategory);
router.put('/:id', categoryController.updateCategory);
module.exports = router;