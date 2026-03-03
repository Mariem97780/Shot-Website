const Contact = require('../models/Contact');

// @desc Envoyer un message (Public)
exports.submitContact = async (req, res) => {
    try {
        const contact = await Contact.create(req.body);
        res.status(201).json({ success: true, data: contact });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc Obtenir tous les messages (Admin Dashboard)
// ASSURE-TOI QUE CE NOM EST EXACTEMENT getMessages
exports.getMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort('-dateEnvoi');
        res.status(200).json({ success: true, count: messages.length, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateMessageStatus = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: contact });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};