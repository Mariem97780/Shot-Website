const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // --- Nouveaux champs Figma (Edit Profile) ---
    surname: { type: String, default: "" },
    shippingAddress: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "Tunisia" },
    zipCode: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    profileImage: { type: String, default: "" }, 
    // --------------------------------------------

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