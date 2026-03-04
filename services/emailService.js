const nodemailer = require('nodemailer');

exports.sendOrderConfirmation = async (userEmail, orderData) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { 
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS 
        }
    });

    // Chemin vers ton logo (vérifie bien que ce chemin est correct sur ton PC)
    const LOGO_PATH = 'C:/Users/MARIEM/Desktop/shot/png_1.png';

    // Sécurisation des données pour éviter les erreurs .toFixed() sur des valeurs vides
    const safeSubTotal = orderData.subTotal ? Number(orderData.subTotal).toFixed(3) : "0.000";
    const safeTotal = orderData.total ? Number(orderData.total).toFixed(3) : "0.000";
    const safeTax = orderData.tax ? Number(orderData.tax).toFixed(3) : "0.000";
    const orderId = orderData._id ? orderData._id.toString() : "N/A";

    const mailOptions = {
        from: '"S.HOT Shop" <noreply@shot.tn>',
        to: userEmail,
        subject: `Order Pending ! #SH-${orderId.slice(-6).toUpperCase()}`,
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"/></head>
        <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f0;padding:30px 0;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:6px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.10);">

                  <!-- HEADER -->
                  <tr>
                    <td style="background:linear-gradient(175deg,#00382a 0%,#005c42 45%,#00765a 100%);padding:44px 30px 38px;text-align:center;">
                      <img src="cid:logo_shot" alt="S.HOT" width="90" style="display:block;margin:0 auto 18px;" />
                      <h1 style="margin:0 0 10px;color:#ffffff;font-size:21px;font-weight:700;">Order Confirmed!</h1>
                      <p style="margin:0;color:#a8ddd0;font-size:13px;line-height:1.65;">
                       Thank you for choosing S.HOT . Your journey to a healthier lifestyle starts now !
                      </p>
                    </td>
                  </tr>

                  <!-- ORDER SUMMARY TITLE -->
                  <tr>
                    <td style="padding:30px 38px 0px;">
                      <p style="margin:0 0 18px;font-size:14.5px;font-weight:700;color:#111111;">Order Summary</p>
                    </td>
                  </tr>

                  <!-- ORDER ROWS -->
                  <tr>
                    <td style="padding:0 38px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13.5px;">

                        <tr>
                          <td style="padding:10px 0;color:#444;border-bottom:1px solid #eeeeee;">Order ID</td>
                          <td style="padding:10px 0;text-align:right;font-weight:600;color:#111;border-bottom:1px solid #eeeeee;">#SH-${orderId.slice(-8).toUpperCase()}</td>
                        </tr>

                        <tr>
                          <td style="padding:10px 0;color:#444;border-bottom:1px solid #eeeeee;">Subtotal</td>
                          <td style="padding:10px 0;text-align:right;font-weight:600;color:#111;border-bottom:1px solid #eeeeee;">${safeSubTotal} DT</td>
                        </tr>

                        <tr>
                          <td style="padding:10px 0;color:#444;">Shipping Cost</td>
                          <td style="padding:10px 0;text-align:right;font-weight:600;color:#111;">7.000 DT</td>
                        </tr>

                      </table>

                      <!-- DIVIDER + TOTAL -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td colspan="2" style="padding-top:6px;border-top:1.5px solid #cccccc;"></td>
                        </tr>
                        <tr>
                          <td style="padding:14px 0 6px;font-size:15px;font-weight:700;color:#111;">Total</td>
                          <td style="padding:14px 0 6px;text-align:right;font-size:15px;font-weight:700;color:#00a87a;">${safeTotal} DT</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- MESSAGE -->
                  <tr>
                    <td style="padding:28px 38px 8px;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#666;line-height:1.75;">
                        If you have questions about your order or just want some tips on starting your spirulina journey , drop us a line at shotpremiumspirulina@gmail.com or browse our FAQs. You can also join our community we‘de love to help you get the most out of your routine !
                      </p>
                    </td>
                  </tr>

                  <!-- DIVIDER -->
                  <tr>
                    <td style="padding:16px 38px 0;">
                      <hr style="border:none;border-top:1px solid #eeeeee;margin:0;" />
                    </td>
                  </tr>

                 <!-- SOCIAL ICONS -->
                  <tr>
                    <td style="padding:18px 38px 4px;text-align:center;">
                      <a href="#" style="display:inline-block;margin:0 8px;text-decoration:none;">
                        <img src="https://img.icons8.com/ios/50/555555/facebook-new.png" width="24" height="24" alt="Facebook" style="display:inline-block;" />
                      </a>
                      <a href="#" style="display:inline-block;margin:0 8px;text-decoration:none;">
                        <img src="https://img.icons8.com/ios/50/555555/instagram-new.png" width="24" height="24" alt="Instagram" style="display:inline-block;" />
                      </a>
                      <a href="#" style="display:inline-block;margin:0 8px;text-decoration:none;">
                        <img src="https://img.icons8.com/ios/50/555555/youtube-play.png" width="24" height="24" alt="YouTube" style="display:inline-block;" />
                      </a>
                      <a href="#" style="display:inline-block;margin:0 8px;text-decoration:none;">
                        <img src="https://img.icons8.com/ios/50/555555/twitterx.png" width="24" height="24" alt="X" style="display:inline-block;" />
                      </a>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="padding:10px 38px 28px;text-align:center;">
                      <p style="margin:0 0 4px;font-size:11px;color:#aaa;line-height:1.6;">This email was sent to you because you placed an order<br/>on S.HOT.</p>
                      <p style="margin:8px 0 0;font-size:11px;color:#aaa;">© 2026 SHOT. All rights reserved.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>`,
        attachments: [{
            filename: 'logo_SHOT.png',
            path: LOGO_PATH,
            cid: 'logo_shot'
        }]
    };

    return transporter.sendMail(mailOptions);
};