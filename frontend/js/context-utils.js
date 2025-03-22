class ConversationContext {
    constructor() {
        this.currentTopic = null;
        this.topicKeywords = {
            menu: ['menu', 'ristorante', 'cena', 'pranzo', 'colazione', 'piatti', 'mangiare', 'cibo'],
            attivita: ['attività', 'fare', 'tour', 'passeggiata', 'escursione', 'visita'],
            servizi: ['servizi', 'camera', 'wifi', 'parcheggio', 'reception', 'pulizia'],
            eventi: ['eventi', 'concerto', 'spettacolo', 'degustazione', 'programma']
        };
        this.shortQuestions = [
            'altro?', 'e poi?', 'cosa altro?', 'continua', 'ad esempio?', 'come?', 
            'e?', 'tipo?', 'ad esempio', 'per esempio', 'quali?', 'e dopo?'
        ];
    }

    /**
     * Analizza un messaggio e aggiorna il contesto della conversazione
     * @param {string} message - Il messaggio dell'utente
     * @param {Array} conversation - Lo storico della conversazione
     * @returns {Object} Informazioni sul contesto
     */
    analyzeMessage(message, conversation) {
        const lowerMessage = message.toLowerCase().trim();
        
        // Verifica se è una domanda breve/di approfondimento
        const isShortQuestion = this.isFollowUpQuestion(lowerMessage);
        
        // Se non è una domanda breve, aggiorna il topic
        if (!isShortQuestion) {
            this.updateTopic(lowerMessage);
        }
        
        return {
            topic: this.currentTopic,
            isFollowUp: isShortQuestion,
            needsMoreContext: isShortQuestion && !this.currentTopic
        };
    }
    
    /**
     * Verifica se il messaggio è una domanda di approfondimento
     */
    isFollowUpQuestion(message) {
        // Verifica nelle domande brevi predefinite
        if (this.shortQuestions.some(q => message === q || message.startsWith(q))) {
            return true;
        }
        
        // Verifica se è una domanda molto breve
        if (message.length < 10 && message.includes('?')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Aggiorna il topic corrente in base al messaggio
     */
    updateTopic(message) {
        // Controlla quale insieme di parole chiave ha più corrispondenze
        let bestMatch = { topic: null, count: 0 };
        
        for (const [topic, keywords] of Object.entries(this.topicKeywords)) {
            const matchCount = keywords.filter(keyword => message.includes(keyword)).length;
            
            if (matchCount > bestMatch.count) {
                bestMatch = { topic, count: matchCount };
            }
        }
        
        // Aggiorna il topic se abbiamo trovato almeno una corrispondenza
        if (bestMatch.count > 0) {
            this.currentTopic = bestMatch.topic;
        }
        
        return this.currentTopic;
    }
    
    /**
     * Suggerisce un'elaborazione del messaggio in base al contesto
     */
    enhanceMessage(originalMessage, conversation) {
        const context = this.analyzeMessage(originalMessage, conversation);
        
        // Se è una domanda di approfondimento e abbiamo un contesto, aggiungiamo informazioni
        if (context.isFollowUp && this.currentTopic) {
            let enhancedMessage = originalMessage;
            
            // Aggiungi contesto basato sul topic
            switch (this.currentTopic) {
                case 'menu':
                    enhancedMessage = `${originalMessage} riguardo al menu del ristorante`;
                    break;
                case 'attivita':
                    enhancedMessage = `${originalMessage} riguardo alle attività disponibili`;
                    break;
                case 'servizi':
                    enhancedMessage = `${originalMessage} riguardo ai servizi dell'hotel`;
                    break;
                case 'eventi':
                    enhancedMessage = `${originalMessage} riguardo agli eventi in programma`;
                    break;
            }
            
            return enhancedMessage;
        }
        
        return originalMessage;
    }
    
    /**
     * Resetta il contesto della conversazione
     */
    reset() {
        this.currentTopic = null;
    }
}

// Crea l'istanza globale
window.conversationContext = new ConversationContext();