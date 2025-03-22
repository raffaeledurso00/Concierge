// backend/src/services/ai/TopicDetector.js
class TopicDetector {
    constructor() {
        this.TOPIC_CATEGORIES = {
            MENU: 'menu',
            ATTIVITA: 'attivita',
            SERVIZI: 'servizi',
            EVENTI: 'eventi',
            METEO: 'meteo',
            GENERALE: 'generale'
        };
        
        // Parole chiave per menu e ristorante
        this.menuKeywords = ['menu', 'ristorante', 'pranzo', 'cena', 'colazione', 'piatti', 'cibo', 
                             'mangiare', 'bevande', 'vino', 'bere', 'prenotare tavolo', 'culinaria', 
                             'chef', 'specialità', 'degustazione'];
        
        // Parole chiave per attività
        this.attivitaKeywords = ['attività', 'cosa fare', 'tour', 'escursione', 'passeggiata', 
                                'camminata', 'visita', 'bicicletta', 'trekking', 'cavallo', 
                                'piscina', 'spa', 'massaggio', 'yoga', 'corsi'];
        
        // Parole chiave per servizi
        this.serviziKeywords = ['servizi', 'wifi', 'parcheggio', 'bagagli', 'assistenza', 
                               'reception', 'check-in', 'checkout', 'camera', 'pulizia', 
                               'navetta', 'transfer', 'orari', 'prenotazione'];
        
        // Parole chiave per eventi
        this.eventiKeywords = ['eventi', 'concerti', 'programma', 'spettacoli', 'intrattenimento', 
                              'degustazione', 'festival', 'mostra', 'esposizione', 'calendario'];
        
        // Parole chiave per meteo
        this.meteoKeywords = ['tempo', 'meteo', 'pioggia', 'sole', 'clima', 'temperatura', 
                             'previsioni', 'caldo', 'freddo', 'umidità'];
    }
    
    /**
     * Rileva l'argomento del messaggio
     */
    detect(message) {
        const lowerMessage = message.toLowerCase();
        
        // Utilizza un sistema di punteggio per determinare l'argomento
        const scores = {
            [this.TOPIC_CATEGORIES.MENU]: 0,
            [this.TOPIC_CATEGORIES.ATTIVITA]: 0,
            [this.TOPIC_CATEGORIES.SERVIZI]: 0,
            [this.TOPIC_CATEGORIES.EVENTI]: 0,
            [this.TOPIC_CATEGORIES.METEO]: 0,
            [this.TOPIC_CATEGORIES.GENERALE]: 0
        };
        
        // Calcola i punteggi per ogni categoria
        this.menuKeywords.forEach(keyword => {
            if (lowerMessage.includes(keyword)) {
                scores[this.TOPIC_CATEGORIES.MENU] += 1;
            }
        });
        
        this.attivitaKeywords.forEach(keyword => {
            if (lowerMessage.includes(keyword)) {
                scores[this.TOPIC_CATEGORIES.ATTIVITA] += 1;
            }
        });
        
        this.serviziKeywords.forEach(keyword => {
            if (lowerMessage.includes(keyword)) {
                scores[this.TOPIC_CATEGORIES.SERVIZI] += 1;
            }
        });
        
        this.eventiKeywords.forEach(keyword => {
            if (lowerMessage.includes(keyword)) {
                scores[this.TOPIC_CATEGORIES.EVENTI] += 1;
            }
        });
        
        this.meteoKeywords.forEach(keyword => {
            if (lowerMessage.includes(keyword)) {
                scores[this.TOPIC_CATEGORIES.METEO] += 1;
            }
        });
        
        // Se non abbiamo match significativi, assegna un punteggio al generale
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        if (totalScore === 0) {
            scores[this.TOPIC_CATEGORIES.GENERALE] = 1;
        }
        
        // Trova la categoria con il punteggio più alto
        let highestCategory = this.TOPIC_CATEGORIES.GENERALE;
        let highestScore = 0;
        
        for (const [category, score] of Object.entries(scores)) {
            if (score > highestScore) {
                highestScore = score;
                highestCategory = category;
            }
        }
        
        return highestCategory;
    }
}

module.exports = TopicDetector;