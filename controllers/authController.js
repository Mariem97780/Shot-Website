const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const { getCurrencyInfo } = require('../utils/currencyConverter');

// Définition du chemin du logo
const LOGO_PATH = 'C:/Users/MARIEM/Desktop/shot/logo_SHOT.png';

// --- 1. INSCRIPTION ---
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ message: "Tous les champs sont obligatoires." });

        let user = await User.findOne({ email });
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // LOGIQUE CORRIGÉE : Si l'utilisateur existe déjà
        if (user) {
            if (user.isVerified) {
                return res.status(400).json({ message: "Cet email est déjà utilisé." });
            } else {
                // Compte non vérifié : on met à jour le code et on renvoie le mail
                user.otpCode = otp;
                user.otpExpires = Date.now() + 5 * 60 * 1000;
                await user.save();
            }
        } else {
            // Nouvel utilisateur
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user = new User({
                username, email, password: hashedPassword,
                otpCode: otp, otpExpires: Date.now() + 5 * 60 * 1000
            });
            await user.save();
        }

        await sendEmail({
            email: user.email,
            subject: "Activation de votre compte SHOT ✨",
            html: `
            <div style="background-color: #f4f7f9; padding: 50px 20px; font-family: 'Segoe UI', Arial, sans-serif; text-align: center;">
                <div style="max-width: 450px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #eef2f4;">
                    <img src="cid:logo_shot" alt="SHOT" width="120" style="margin-bottom: 30px; display: block; margin-left: auto; margin-right: auto;">
                    <h2 style="color: #333; margin-bottom: 10px;">Bonjour ${user.username},</h2>
                    <p style="color: #666; font-size: 15px; line-height: 1.6;">Voici votre code pour activer votre compte :</p>
                    <div style="background-color: #16bcc2; color: white; padding: 20px; border-radius: 12px; font-size: 35px; font-weight: bold; display: inline-block; margin: 25px 0; min-width: 180px; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #e74c3c; font-size: 13px; font-weight: bold;">⚠️ Ce code expirera dans 5 minutes.</p>
                </div>
            </div>`,
            attachments: [{ filename: 'logo_SHOT.png', path: LOGO_PATH, cid: 'logo_shot' }]
        });
        res.status(201).json({ message: "Utilisateur créé ou mis à jour ! Code envoyé." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'inscription." });
    }
};

// --- 2. RÉINITIALISATION MOT DE PASSE ---
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

        const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
        user.otpCode = resetCode;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        await sendEmail({
            email: user.email,
            subject: "Réinitialisation de votre mot de passe SHOT 🔑",
            html: `
            <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #68ccb6; padding: 20px; text-align: center;">
                    <img src="cid:logo_shot" alt="S.HOT" style="width: 100px;">
                </div>
                <div style="padding: 30px; text-align: center;">
                    <h2 style="color: #333;">Réinitialisation de mot de passe</h2>
                    <p style="color: #666;">Vous avez demandé à changer votre mot de passe. Utilisez le code ci-dessous :</p>
                    <div style="background-color: #f4f4f4; border-radius: 4px; display: inline-block; padding: 15px 30px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #080a0a; letter-spacing: 5px;">${resetCode}</span>
                    </div>
                    <p style="color: #e74c3c; font-size: 14px; font-weight: bold;">⚠️ Ce code est valable uniquement pendant 5 minutes.</p>
                </div>
            </div>`,
            attachments: [{ filename: 'logo_SHOT.png', path: LOGO_PATH, cid: 'logo_shot' }]
        });
        res.json({ message: "Code de réinitialisation envoyé !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// --- 3. VÉRIFICATION OTP ---
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.otpCode !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Code invalide ou expiré." });
        }
        user.isVerified = true;
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();
        res.json({ message: "Compte vérifié ! 🚀" });
    } catch (error) {
        res.status(500).json({ message: "Erreur de vérification." });
    }
};

// --- 4. RESET PASSWORD FINAL ---
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.otpCode !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Code invalide ou expiré." });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();
        res.json({ message: "Mot de passe modifié avec succès !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur modification." });
    }
};

// --- 5. CONNEXION AVEC CURRENCY AUTO (CORRIGÉE) ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "Veuillez vérifier votre compte." });
        }

        // 1. Définition du TOKEN (Correctement placé)
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // 2. Détection de l'IP et Currency
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const currencyData = await getCurrencyInfo(ip);

        // 3. Envoi de la réponse unique
        res.json({ 
            token, 
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }, 
            currencyData, 
            message: "Bienvenue sur SHOT ! ✨" 
        });

    } catch (error) {
        console.error("Erreur Login:", error);
        res.status(500).json({ message: "Erreur lors de la connexion." });
    }
};

// --- 6. MISE À JOUR DU PROFIL ---
exports.updateProfile = async (req, res) => {
    try {
        // req.user.id doit être défini par ton middleware 'protect'
        const user = await User.findById(req.user.id); 

        if (user) {
            user.username = req.body.surname || user.username; // Note: tu envoies 'surname' dans Postman
            user.address = req.body.address || user.address;
            user.city = req.body.city || user.city;
            // ... autres champs
            const updatedUser = await user.save();
            res.json({ message: "Profil mis à jour !", user: updatedUser });
        } else {
            res.status(404).json({ message: "Utilisateur non trouvé" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur mise à jour.", error: error.message });
    }
};
// --- 7. SUPPRIMER MON COMPTE ---
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        await User.findByIdAndDelete(userId);
        res.json({ success: true, message: "Compte supprimé." });
    } catch (error) {
        res.status(500).json({ message: "Erreur suppression." });
    }
};
