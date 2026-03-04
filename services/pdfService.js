const PDFDocument = require('pdfkit');
const path = require('path');

exports.generateInvoicePDF = (order, res) => {
    const doc = new PDFDocument({ margin: 50 });

    // Envoi du flux PDF au client
    doc.pipe(res);

    // --- LOGO ET EN-TÊTE ---
    const LOGO_PATH = 'C:/Users/MARIEM/Desktop/shot/logo_SHOT.png'; 
    
    try {
        doc.image(LOGO_PATH, 50, 45, { width: 60 });
    } catch (err) {
        console.log("Logo introuvable pour le PDF, continuation sans image.");
    }

    doc.fillColor('#006b54')
       .fontSize(20)
       .text('S.HOT SHOP', 120, 50, { align: 'right' });
    
    doc.fillColor('#444444')
       .fontSize(10)
       .text('Tunisie, Tunis', 120, 75, { align: 'right' });
    doc.text('Contact: shotpremiumspirulina@gmail.com', 120, 90, { align: 'right' });

    doc.moveDown(2);
    doc.moveTo(50, 115).lineTo(550, 115).stroke('#eeeeee');

    // --- INFOS FACTURE ---
    doc.moveDown(2);
    doc.fillColor('#000000').fontSize(14).text(`FACTURE N° #SH-${order._id.toString().slice(-6).toUpperCase()}`, { underline: true });
    doc.fontSize(10).text(`Date de commande : ${new Date(order.dateCommande).toLocaleDateString()}`, { underline: false });

    // --- BLOC ADRESSE CORRIGÉ ---
    doc.moveDown();
    doc.fontSize(12).fillColor('#006b54').text('Destinataire :', { bold: true });
    doc.fillColor('#000000').fontSize(10);

    // ✅ FIX PRINCIPAL : on cherche surname ET nom sur order.user
    let nomClient = "Client S.HOT"; // fallback par défaut

    if (order.user) {
        console.log(">>> order.user reçu dans PDF :", JSON.stringify(order.user));

        const prenom = order.user.surname || "";
        const nom    = order.user.username || order.user.nom || "";

        const fullName = `${prenom} ${nom}`.trim();

        if (fullName.length > 0) {
            nomClient = fullName;
        }
    }

    // Secours : si toujours vide, on essaie l'adresse de livraison
    if (nomClient === "Client S.HOT" && order.adresseLivraison) {
        const prenomAdr = order.adresseLivraison.prenom || order.adresseLivraison.surname || "";
        const nomAdr    = order.adresseLivraison.nom || "";
        const fullAdr   = `${prenomAdr} ${nomAdr}`.trim();
        if (fullAdr.length > 0) nomClient = fullAdr;
    }

    doc.text(nomClient);

    // Reste de l'adresse
    if (order.adresseLivraison) {
        doc.text(`${order.adresseLivraison.rue || "Avenue Habib Bourguiba"}`);
        doc.text(`${order.adresseLivraison.ville || "Tunis"}, Tunisie`);
    }

    // --- TABLEAU DES PRODUITS ---
    doc.moveDown(2);
    const tableTop = 250;
    doc.fillColor('#006b54').fontSize(10);
    doc.text('PRODUIT', 50, tableTop, { bold: true });
    doc.text('QTÉ', 300, tableTop, { bold: true });
    doc.text('PRIX UNIT.', 400, tableTop, { bold: true });
    doc.text('TOTAL', 500, tableTop, { bold: true });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#006b54');

    let i = 0;
    doc.fillColor('#000000');
    order.orderItems.forEach(item => {
        const y = tableTop + 30 + (i * 25);
        doc.text(item.product.name, 50, y);
        doc.text(item.quantity.toString(), 300, y);
        doc.text(`${item.price.toFixed(3)} DT`, 400, y);
        doc.text(`${(item.quantity * item.price).toFixed(3)} DT`, 500, y);
        i++;
    });

    // --- RÉSUMÉ FINAL ---
    const summaryTop = tableTop + 60 + (i * 25);
    doc.moveTo(350, summaryTop).lineTo(550, summaryTop).stroke('#eeeeee');

    doc.fontSize(10).text('Sous-total :', 350, summaryTop + 15);
    doc.text(`${order.subTotal.toFixed(3)} DT`, 500, summaryTop + 15);

    doc.text('Frais de livraison :', 350, summaryTop + 30);
    doc.text(`${order.fraisLivraison.toFixed(3)} DT`, 500, summaryTop + 30);

    doc.fontSize(14).fillColor('#006b54').text('TOTAL À PAYER :', 350, summaryTop + 50, { bold: true });
    doc.text(`${order.total.toFixed(3)} DT`, 500, summaryTop + 50);

    // --- PIED DE PAGE ---
    doc.fillColor('#888888').fontSize(8).text(
        'Merci pour votre confiance ! À bientôt sur S.HOT SHOP.',
        50, 700, { align: 'center', width: 500 }
    );

    doc.end();
};