const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // On essaie de se connecter
        await mongoose.connect(process.env.MONGO_URI);
console.log(`MongoDB connecté à : ${mongoose.connection.host} 🚀`);    } catch (err) {
        // Si ça rate, on affiche l'erreur et on arrête tout
        console.error("Erreur de connexion : ", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;