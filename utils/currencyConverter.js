const axios = require('axios');
const CURRENCY_API_KEY = process.env.CURRENCY_API_KEY; 

exports.getCurrencyInfo = async (userIp, forcedCurrency = null) => {
    try {
        const testIp = (userIp === '::1' || userIp === '127.0.0.1') ? '197.0.0.1' : userIp;
        
        let targetCurrency;
        let symbol = "";

        // Si l'utilisateur a choisi manuellement (G2A style), on utilise sa sélection
        if (forcedCurrency) {
            targetCurrency = forcedCurrency;
        } else {
            // Sinon, on détecte par IP
            const geoRes = await axios.get(`https://ipapi.co/${testIp}/json/`);
            targetCurrency = geoRes.data.currency || 'USD';
            symbol = geoRes.data.currency_symbol;
        }

        const currencyRes = await axios.get(`https://api.freecurrencyapi.com/v1/latest?apikey=${CURRENCY_API_KEY}&base_currency=USD`);
        const rate = currencyRes.data.data[targetCurrency] || 1;

        return {
            code: targetCurrency,
            rate: rate,
            symbol: symbol || targetCurrency
        };
    } catch (error) {
        console.error("Erreur Currency:", error.message);
        return { code: 'USD', rate: 1, symbol: '$' };
    }
};