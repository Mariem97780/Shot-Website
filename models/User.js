const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // --- Champs mis à jour pour correspondre à Figma et au Controller ---
    surname: { type: String, default: "" },
    address: { type: String, default: "" },      // Renommé (anciennement shippingAddress)
    city: { type: String, default: "" },
    country: { type: String, default: "Tunisia" },
    zipCode: { type: String, default: "" },
    phone: { type: String, default: "" },        // Renommé (anciennement phoneNumber)
    profileImage: { type: String, default: "" }, 
    // ------------------------------------------------------------------

    isVerified: { type: Boolean, default: false },
    otpCode: { type: String },
    otpExpires: { type: Date },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);