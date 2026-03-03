const axios = require('axios');

// Utilisation de la variable d'environnement pour plus de sécurité
const CURRENCY_API_KEY = process.env.CURRENCY_API_KEY; 

exports.getCurrencyInfo = async (userIp) => {
    try {
        // Gestion de l'IP locale pour les tests en Tunisie
        const testIp = (userIp === '::1' || userIp === '127.0.0.1') ? '197.0.0.1' : userIp;
        
        const geoRes = await axios.get(`https://ipapi.co/${testIp}/json/`);
        const localCurrency = geoRes.data.currency || 'USD';

        const currencyRes = await axios.get(`https://api.freecurrencyapi.com/v1/latest?apikey=${CURRENCY_API_KEY}&base_currency=USD`);
        
        const rate = currencyRes.data.data[localCurrency] || 1;

        return {
            code: localCurrency,
            rate: rate,
            symbol: geoRes.data.currency_symbol || localCurrency,
            country: geoRes.data.country_name
        };
    } catch (error) {
        console.error("Erreur Currency:", error.message);
        return { code: 'USD', rate: 1, symbol: '$' };
    }
};