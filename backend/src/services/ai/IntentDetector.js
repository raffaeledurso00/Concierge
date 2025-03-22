// backend/src/services/ai/IntentDetector.js
class IntentDetector {
    constructor() {
        // Definisci gli intenti con pattern di riconoscimento
        this.intents = [
            {
                name: 'inquiry_restaurant',
                patterns: [/ristorante/, /mangiare/, /cena/, /pranzo/, /prenotare tavolo/, /menu/],
                confidence: 0
            },
            {
                name: 'inquiry_activities',
                patterns: [/cosa fare/, /attività/, /escursion/, /visita/, /tour/, /esperienz/],
                confidence: 0
            },
            {
                name: 'inquiry_facilities',
                patterns: [/servizi/, /wifi/, /piscina/, /spa/, /camera/, /orari/],
                confidence: 0
            },
            {
                name: 'booking_request',
                patterns: [/prenotare/, /vorrei riservare/, /disponibilità/, /posso/, /quando/],
                confidence: 0
            },
            {
                name: 'greeting',
                patterns: [/^ciao/, /^salve/, /^buongiorno/, /^buonasera/, /^hey/],
                confidence: 0
            },
            {
                name: 'thanks',
                patterns: [/grazie/, /ringrazio/, /gentile/],
                confidence: 0
            }
        ];
    }
    
    /**
     * Rileva l'intento del messaggio dell'utente
     */
    detectIntent(message) {
        // Normalizza il messaggio
        const normalizedMessage = message.toLowerCase();
        
        // Reset delle confidenze
        this.intents.forEach(intent => {
            intent.confidence = 0;
        });
        
        // Calcola la confidenza per ogni intento
        this.intents.forEach(intent => {
            intent.patterns.forEach(pattern => {
                if (pattern.test(normalizedMessage)) {
                    intent.confidence += 1;
                }
            });
        });
        
        // Ordina gli intenti per confidenza e prendi il più probabile
        const sortedIntents = [...this.intents].sort((a, b) => b.confidence - a.confidence);
        
        // Restituisci l'intento con confidenza più alta se supera una soglia
        return sortedIntents[0].confidence > 0 ? sortedIntents[0].name : 'general_inquiry';
    }
}

module.exports = IntentDetector;