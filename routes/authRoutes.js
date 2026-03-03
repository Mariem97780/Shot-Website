const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth'); // <--- AJOUTE CETTE LIGNE

// --- ROUTES CLASSIQUES (OTP) ---
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
// Route de suppression (sécurisée par protect)
router.delete('/delete-account', protect, authController.deleteAccount);

// --- MISE À JOUR PROFIL (SÉCURISÉE) ---
// On ajoute 'protect' ici pour que req.user existe
router.put('/update-profile', protect, authController.updateProfile);

// --- ROUTES GOOGLE ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.send(`<h1>Bravo ! Utilisateur ${req.user.username} connecté.</h1>`);
  }
);

module.exports = router;