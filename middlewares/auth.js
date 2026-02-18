const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Accès refusé" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        return next(); // Ajoute 'return' devant next()
    } catch (err) {
        return res.status(401).json({ message: "Token invalide" });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next(); // Ajoute 'return' devant next()
    }
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
};

module.exports = { protect, admin }; // On force l'export sous forme d'objet