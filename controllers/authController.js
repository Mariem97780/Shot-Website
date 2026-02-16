const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// --- 1. INSCRIPTION (REGISTER) ---
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Oups ! Tous les champs sont obligatoires." });
        }
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Cet email est déjà utilisé chez SHOT ! 🌿" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        user = new User({
            username, email, password: hashedPassword,
            otpCode: otp, otpExpires: Date.now() + 10 * 60 * 1000, role: 'user' 
        });
        
        // On sauvegarde l'utilisateur avant d'essayer d'envoyer l'email
        await user.save();

        try {
            await sendEmail({
                email: user.email,
                subject: "Activation de votre compte SHOT ✨",
                message: `Bonjour ${username}, votre code d'activation est : ${otp}`,
                html: `
                <div style="background-color: #f4f7f9; padding: 40px; font-family: Arial, sans-serif;">
                    <div style="max-width: 450px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 20px; text-align: center; border: 1px solid #e1e4e8;">
                        <h1 style="color: #16bcc2; margin-bottom: 20px;">SHOT</h1>
                        <p style="font-size: 16px; color: #4f5660;">Bonjour <strong>${username}</strong>,</p>
                        <p style="font-size: 15px; color: #4f5660; line-height: 24px;">Voici votre code d'activation :</p>
                        <div style="background-color: #16bcc2; color: #ffffff; padding: 20px 40px; border-radius: 12px; font-size: 40px; font-weight: bold; display: inline-block; margin: 20px 0;">
                            ${otp}
                        </div>
                    </div>
                </div>`
            });
            res.status(201).json({ message: "Utilisateur créé ! Code OTP envoyé. 📧" });
        } catch (mailErr) {
            // Si le mail échoue, l'utilisateur est quand même dans la base, on peut voir l'OTP dans Compass
            res.status(201).json({ message: "Utilisateur créé, erreur envoi email. Vérifiez Compass." });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'inscription." });
    }
};

// --- 2. MOT DE PASSE OUBLIÉ (FORGOT PASSWORD) ---
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Aucun compte trouvé." });

        const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
        
        // MODIFICATION : On met à jour et on SAUVEGARDE avant d'envoyer le mail
        user.otpCode = resetCode;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        await sendEmail({
            email: user.email,
            subject: "Réinitialisation de votre mot de passe SHOT",
            message: `Votre code de récupération est : ${resetCode}`,
            html: `
            <div style="background-color: #f4f7f9; padding: 40px; font-family: Arial, sans-serif;">
                <div style="max-width: 450px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 20px; text-align: center; border: 1px solid #e1e4e8;">
                    <h1 style="color: #16bcc2; margin-bottom: 20px;">SHOT</h1>
                    <p style="font-size: 15px; color: #4f5660;">Votre code de récupération est :</p>
                    <div style="background-color: #16bcc2; color: #ffffff; padding: 20px 40px; border-radius: 12px; font-size: 40px; font-weight: bold; display: inline-block; margin: 20px 0;">
                        ${resetCode}
                    </div>
                </div>
            </div>`
        });
        res.json({ message: "Code envoyé ! 📧" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'envoi." });
    }
};

// --- 3. VÉRIFICATION OTP ---
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        
        // Comparaison stricte du code et de l'expiration
        if (!user || user.otpCode !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Code invalide ou expiré." });
        }

        user.isVerified = true;
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();
        res.json({ message: "Compte vérifié ! 🚀" });
    } catch (error) {
        res.status(500).json({ message: "Erreur vérification." });
    }
};

// --- 4. RÉINITIALISATION FINALE (RESET PASSWORD) ---
exports.resetPassword = async (req, res) => {
    try {
        // Utilisation de "otp" pour correspondre au code reçu
        const { email, otp, newPassword } = req.body;
        
        const user = await User.findOne({ email });

        // Vérification manuelle plus précise pour le debug
        if (!user || user.otpCode !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Code invalide ou expiré." });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        // Nettoyage après succès
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();

        res.json({ message: "Mot de passe modifié avec succès ! ✅" });
    } catch (error) {
        res.status(500).json({ message: "Erreur réinitialisation." });
    }
};

// --- 5. CONNEXION (LOGIN) ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        }
        
        if (!user.isVerified) return res.status(401).json({ message: "Vérifie ton compte d'abord." });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ 
            token, 
            user: { id: user._id, username: user.username, email: user.email }, 
            message: "Bienvenue ! 🔑" 
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur connexion." });
    }
};