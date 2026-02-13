const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Vérifier si l'utilisateur existe déjà par son email Google
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) return done(null, user);

      // Si c'est un nouvel utilisateur, on le crée
      user = await User.create({
        username: profile.displayName,
        email: profile.emails[0].value,
        password: 'google-auth-no-password', // Pas besoin de MDP pour Google
        isVerified: true // Google vérifie déjà l'email pour nous
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user));
});