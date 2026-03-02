const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPaymentStatus);

module.exports = router;