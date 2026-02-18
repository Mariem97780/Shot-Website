const Avis = require('../models/Avis');
const PhotoAvis = require('../models/PhotoAvis');

exports.addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;

        const newAvis = await Avis.create({
            user: req.user._id, // Identifié par le middleware protect
            product: productId,
            rating,
            comment
        });

        if (req.files && req.files.length > 0) {
            const photoPromises = req.files.map(file => {
                return PhotoAvis.create({
                    avis: newAvis._id,
                    url: file.path // URL Cloudinary
                });
            });
            await Promise.all(photoPromises);
        }

        res.status(201).json({ success: true, message: "Avis ajouté !", data: newAvis });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
// @desc    Supprimer un avis et ses photos liées
exports.deleteReview = async (req, res) => {
    try {
        const avis = await Avis.findById(req.params.id);

        if (!avis) {
            return res.status(404).json({ success: false, message: "Avis non trouvé" });
        }

        // Vérifier si c'est l'auteur de l'avis ou un admin qui supprime
        if (avis.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: "Non autorisé" });
        }

        // Supprimer les photos liées dans la base (et idéalement sur Cloudinary)
        await PhotoAvis.deleteMany({ avis: avis._id });
        await avis.deleteOne();

        res.status(200).json({ success: true, message: "Avis supprimé" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};