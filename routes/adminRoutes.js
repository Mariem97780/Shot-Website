const express = require('express');
const router = express.Router();
// 1. Utilise getDashboardStats au lieu de getDashboardData
const { getDashboardStats } = require('../controllers/adminController'); 
// 2. Utilise admin au lieu de isAdmin
const { protect, admin } = require('../middlewares/auth'); 

// 3. Ligne 8 : Utilise les variables corrigées
router.get('/stats', protect, admin, getDashboardStats); 

module.exports = router;