// 1. On appelle nos outils
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const session = require('express-session'); // AJOUTÉ
const passport = require('passport'); // AJOUTÉ
const cors = require('cors');

// 2. On charge nos secrets du fichier .env
dotenv.config();

// IMPORTATION DE TA CONFIG PASSPORT (TRÈS IMPORTANT)
require('./config/passport'); // AJOUTÉ : C'est cette ligne qui corrige l'erreur "Unknown strategy"

connectDB();

// 3. On crée l'application
const app = express();
app.use(cors());

// 4. On permet à l'app de lire le format JSON
app.use(express.json());

// CONFIGURATION DES SESSIONS (OBLIGATOIRE POUR PASSPORT)
app.use(session({
    secret: 'shot_secret_key',
    resave: false,
    saveUninitialized: false
}));

// INITIALISATION DE PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// 5. Une petite route de test
app.get('/', (req, res) => {
    res.send("Le serveur de SHOT est en ligne ! 🚀");
});

// 6. Routes et Lancement
app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Le serveur tourne sur : http://localhost:${PORT}`);
});