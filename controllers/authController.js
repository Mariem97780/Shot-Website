const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// Définition du chemin du logo
const LOGO_PATH = 'C:/Users/MARIEM/Desktop/shot/logo_SHOT.png';

// --- 1. INSCRIPTION ---
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ message: "Tous les champs sont obligatoires." });

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Cet email est déjà utilisé." });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        user = new User({
            username, email, password: hashedPassword,
            otpCode: otp, otpExpires: Date.now() + 5 * 60 * 1000
        });
        await user.save();

        await sendEmail({
            email: user.email,
            subject: "Activation de votre compte SHOT ✨",
            html: `
            <div style="background-color: #f4f7f9; padding: 50px 20px; font-family: 'Segoe UI', Arial, sans-serif; text-align: center;">
                <div style="max-width: 450px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #eef2f4;">
                    <img src="cid:logo_shot" alt="SHOT" width="120" style="margin-bottom: 30px; display: block; margin-left: auto; margin-right: auto;">
                    <h2 style="color: #333; margin-bottom: 10px;">Bonjour ${username},</h2>
                    <p style="color: #666; font-size: 15px; line-height: 1.6;">Merci de nous avoir rejoint ! Voici votre code pour activer votre compte et commencer l'aventure SHOT :</p>
                    <div style="background-color: #16bcc2; color: white; padding: 20px; border-radius: 12px; font-size: 35px; font-weight: bold; display: inline-block; margin: 25px 0; min-width: 180px; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #999; font-size: 13px;">Ce code est valable pendant 5 minutes. À très bientôt !</p>
                </div>
            </div>`,
            attachments: [{ filename: 'logo_SHOT.png', path: LOGO_PATH, cid: 'logo_shot' }]
        });
        res.status(201).json({ message: "Utilisateur créé ! Code envoyé." });
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
            <div style="background-color: #f4f7f9; padding: 50px 20px; font-family: 'Segoe UI', Arial, sans-serif; text-align: center;">
                <div style="max-width: 450px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #eef2f4;">
                    <img src="cid:logo_shot" alt="SHOT" width="120" style="margin-bottom: 30px; display: block; margin-left: auto; margin-right: auto;">
                    <h2 style="color: #333; margin-bottom: 10px;">Bonjour,</h2>
                    <p style="color: #666; font-size: 15px; line-height: 1.6;">Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de récupération :</p>
                    <div style="background-color: #16bcc2; color: white; padding: 20px; border-radius: 12px; font-size: 35px; font-weight: bold; display: inline-block; margin: 25px 0; min-width: 180px; letter-spacing: 5px;">
                        ${resetCode}
                    </div>
                    <p style="color: #999; font-size: 13px;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
                </div>
            </div>`,
            attachments: [{ filename: 'logo_SHOT.png', path: LOGO_PATH, cid: 'logo_shot' }]
        });
        res.json({ message: "Code de réinitialisation envoyé !" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur lors de l'envoi." });
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

// --- 5. CONNEXION ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        }
        if (!user.isVerified) return res.status(401).json({ message: "Veuillez vérifier votre compte." });
        
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email }, message: "Bienvenue !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la connexion." });
    }
};
// --- 6. MISE À JOUR DU PROFIL (FIGMA) ---
exports.updateProfile = async (req, res) => {
    try {
        const { userId, ...otherData } = req.body;
        const updateData = { ...otherData };

        // Si une image a été uploadée, on ajoute l'URL Cloudinary
        if (req.file) {
            updateData.profileImage = req.file.path; 
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
        res.json({ message: "Profil mis à jour !", user });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour." });
    }
};