// backend/src/services/ai/KeyInfoExtractor.js
class KeyInfoExtractor {
    /**
     * Estrae informazioni chiave dal messaggio dell'utente
     */
    extract(message) {
        const keyInfo = {};
        
        // Estrai preferenze alimentari
        if (message.match(/vegetarian|vegan|allergic|intolerant|celiac|vegano|vegetariano|allergia|intolleranza|celiaco/i)) {
            keyInfo.dietaryPreferences = message;
        }
        
        // Estrai interessi dell'ospite
        if (message.match(/interested in|like to|prefer|enjoy|interessa|preferisco|mi piace|vorrei/i)) {
            keyInfo.interests = message;
        }
        
        // Estrai informazioni temporali
        if (message.match(/tomorrow|next week|tonight|today|domani|prossima settimana|stasera|oggi/i)) {
            keyInfo.timeReferences = message;
        }
        
        // Estrai il numero di persone
        const personMatch = message.match(/per (\d+) person[e|a]/i);
        if (personMatch) {
            keyInfo.groupSize = personMatch[1];
        }
        
        return keyInfo;
    }
}

module.exports = KeyInfoExtractor;