const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Accès refusé" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        return next(); 
    } catch (err) {
        return res.status(401).json({ message: "Token invalide" });
    }
};

// Change 'isAdmin' en 'admin' ici pour correspondre à tes routes
const admin = (req, res, next) => { 
    if (req.user && req.user.role === 'admin') {
        return next(); 
    }
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
};

// Exporte-le sous le nom 'admin'
module.exports = { protect, admin };