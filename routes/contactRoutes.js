const express = require('express');
const router = express.Router();
const { submitContact, getMessages, updateMessageStatus } = require('../controllers/contactController');

// CORRECTION : Remplace isAdmin par admin ici
const { protect, admin } = require('../middlewares/auth'); 

router.post('/', submitContact);

// CORRECTION : Utilise admin ici aussi (Ligne 7)
router.get('/', protect, admin, getMessages); 
router.put('/:id', protect, admin, updateMessageStatus);

module.exports = router;