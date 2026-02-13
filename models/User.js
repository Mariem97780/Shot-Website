const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otpCode: {
        type: String // Stocke le code à 6 chiffres
    },
    otpExpires: {
        type: Date // Date d'expiration du code
    },
    role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
}
});

module.exports = mongoose.model('User', UserSchema);