const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');

dotenv.config();
require('./config/passport'); 

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURATION DES SESSIONS
app.use(session({
    secret: 'shot_secret_key',
    resave: false,
    saveUninitialized: false
}));

// INITIALISATION DE PASSPORT
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send("Le serveur de SHOT est en ligne ! 🚀");
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes')); // AJOUTÉ
app.use('/api/products', require('./routes/productRoutes')); 
app.use('/api/reviews', require('./routes/reviewRoutes'));      // AJOUTÉ

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Le serveur tourne sur : http://localhost:${PORT}`);
});