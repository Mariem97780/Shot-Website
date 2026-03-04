const express = require('express');
const router = express.Router();

// On importe les deux controllers nécessaires
const adminCtrl = require('../controllers/adminController'); 
const reviewCtrl = require('../controllers/reviewController'); 
const { protect, admin } = require('../middlewares/auth'); 

// Sécurité : Seul l'admin peut accéder à ces routes
router.use(protect);
router.use(admin);

// --- ROUTES STATS ---
router.get('/stats', adminCtrl.getDashboardStats); 

// --- ROUTES USERS ---
router.get('/users', adminCtrl.getAllUsers); 

// --- ROUTES CONTACT ---
router.get('/messages', adminCtrl.getMessages); 
router.put('/messages/:id', adminCtrl.updateMessageStatus); 

// --- ROUTES AVIS (REVIEWS) ---
router.get('/reviews', adminCtrl.getAllReviews); 
router.delete('/reviews/:id', reviewCtrl.deleteReview); // Utilise la suppression du reviewController

module.exports = router;