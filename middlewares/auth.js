const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Vérifie si l'utilisateur est connecté (Token valide)
const protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Accès refusé" });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next(); 
    } catch (err) {
        return res.status(401).json({ message: "Token invalide" });
    }
};

// Vérifie si l'utilisateur est bien un ADMIN
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ 
            success: false, 
            message: "Accès refusé : Réservé aux administrateurs" 
        });
    }
};

module.exports = { protect, admin };