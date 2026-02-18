const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// --- ROUTES CLASSIQUES (OTP) ---
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login); // <-- Ajoute cette ligne
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.put('/update-profile', authController.updateProfile);
// --- ROUTES GOOGLE ---
// 1. Lance l'authentification quand on clique sur le bouton Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. Le retour automatique de Google
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Redirection après succès (pour le test, on envoie un message)
    res.send(`<h1>Bravo ! Utilisateur ${req.user.username} connecté.</h1>`);
  }
);

module.exports = router;