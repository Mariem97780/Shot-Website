const Address = require('../models/Address');

exports.createAddress = async (req, res) => {
    try {
        const { rue, ville, codePostal, telephone } = req.body;
        const address = await Address.create({
            user: req.user._id,
            rue,
            ville,
            codePostal,
            telephone
        });
        res.status(201).json({ success: true, data: address });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getUserAddresses = async (req, res) => {
    const addresses = await Address.find({ user: req.user._id });
    res.json({ success: true, data: addresses });
};