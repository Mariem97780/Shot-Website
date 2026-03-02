const PDFDocument = require('pdfkit');

exports.generateInvoicePDF = (order, res) => {
    const doc = new PDFDocument({ margin: 50 });

    // Envoi du PDF directement au navigateur
    doc.pipe(res);

    // --- EN-TÊTE ---
    doc.fontSize(25).text('S.HOT - FACTURE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Commande N° : ${order._id}`);
    doc.text(`Date : ${new Date(order.dateCommande).toLocaleDateString()}`);
    doc.moveDown();

    // --- ADRESSE ---
    doc.fontSize(12).text('Adresse de livraison :', { underline: true });
    doc.fontSize(10).text(`${order.adresseLivraison.prenom} ${order.adresseLivraison.nom}`);
    doc.text(`${order.adresseLivraison.rue}, ${order.adresseLivraison.ville}`);
    doc.moveDown();

    // --- TABLEAU DES PRODUITS ---
    doc.fontSize(12).text('Produits commandés :', { underline: true });
    doc.moveDown(0.5);

    order.orderItems.forEach(item => {
        doc.fontSize(10).text(
            `${item.product.name} x${item.quantity} .................... ${item.price * item.quantity} DT`
        );
    });

    // --- RÉSUMÉ FINANCIER (Sans Taxe) ---
    doc.moveDown();
    doc.fontSize(12).text('-----------------------------------');
    doc.text(`Sous-total : ${order.subTotal} DT`);
    doc.text(`Livraison : ${order.fraisLivraison} DT`);
    doc.fontSize(14).text(`TOTAL : ${order.total} DT`, { bold: true });

    doc.end();
};