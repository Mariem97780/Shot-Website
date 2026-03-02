const nodemailer = require('nodemailer');

exports.sendOrderConfirmation = async (userEmail, orderData) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const mailOptions = {
        from: '"S.HOT Shop" <noreply@shot.tn>',
        to: userEmail,
        subject: `Confirmation de votre commande #${orderData._id.toString().slice(-6)}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color: #2D3436;">Merci pour votre achat !</h2>
                <p>Votre commande est : <b>${orderData.statut}</b>.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #00B894; margin: 20px 0;">
                    <p style="margin: 0;"><strong>🚚 Numéro de suivi :</strong></p>
                    <h3 style="margin: 5px 0; color: #0984e3;">${orderData.numeroDeSuivi}</h3>
                    <small>Utilisez ce numéro pour suivre votre colis sur notre site.</small>
                </div>

                <hr style="border: 0; border-top: 1px solid #eee;"/>
                <h4>Détails de la livraison :</h4>
                <p>${orderData.address}</p>
                <hr style="border: 0; border-top: 1px solid #eee;"/>
                <h4>Articles :</h4>
                ${orderData.itemsList}
                <hr style="border: 0; border-top: 1px solid #eee;"/>
                <p><b>Sous-total :</b> ${orderData.total - 7} DT</p>
                <p><b>Livraison :</b> 7 DT</p>
                <h3 style="color: #00B894;">Total Final : ${orderData.total} DT</h3>
            </div>
        `
    };
    return transporter.sendMail(mailOptions);
};