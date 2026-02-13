const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Ajout du host explicite
        port: 465,              // Utilisation du port sécurisé
        secure: true,           // Force la connexion sécurisée
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: `"SHOT Website" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;