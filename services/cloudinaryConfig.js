const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure tes clés (à mettre dans ton fichier .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration du stockage dynamique par dossier
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderPath = 'shot/others';
    if (file.fieldname === 'profileImage') folderPath = 'shot/profiles';
    if (file.fieldname === 'productImages') folderPath = 'shot/products';
    if (file.fieldname === 'reviewImages') folderPath = 'shot/reviews';

    return {
      folder: folderPath,
      allowed_formats: ['jpg', 'png', 'jpeg'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Optimisation auto
    };
  },
});

const uploadCloud = multer({ storage });
module.exports = uploadCloud;