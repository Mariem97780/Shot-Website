const express = require('express');
const router = express.Router();
const { createAddress, getUserAddresses } = require('../controllers/addressController');
const { protect } = require('../middlewares/auth');

router.route('/')
    .post(protect, createAddress)
    .get(protect, getUserAddresses);

module.exports = router;