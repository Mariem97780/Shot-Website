const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Configuration du transporteur (Gmail)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    // 2. Définition des options du mail
    const mailOptions = {
        from: '"SHOT 🌿" <noreply@shot.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
        // C'est cette ligne avec la VIRGULE juste au-dessus qui est cruciale
        attachments: options.attachments 
    };

    // 3. Envoi réel
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;