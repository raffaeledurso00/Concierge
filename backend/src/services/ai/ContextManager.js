// backend/src/services/ai/ContextManager.js
const KeyInfoExtractor = require('./KeyInfoExtractor');
const TopicDetector = require('./TopicDetector');

class ContextManager {
    constructor() {
        this.keyInfoExtractor = new KeyInfoExtractor();
        this.topicDetector = new TopicDetector();
        this.conversationContexts = {};
    }
    
    /**
     * Ottiene il contesto della conversazione per una stanza
     */
    getContext(roomId) {
        return this.conversationContexts[roomId] || { 
            messages: [],
            keyInformation: {},
            currentTopic: 'generale',
            lastUpdateTime: new Date()
        };
    }
    
    /**
     * Aggiorna il contesto della conversazione con il nuovo messaggio
     */
    updateConversation(roomId, message, sender) {
        if (!this.conversationContexts[roomId]) {
            this.conversationContexts[roomId] = {
                messages: [],
                keyInformation: {},
                currentTopic: null,
                lastUpdateTime: new Date()
            };
        }
        
        // Aggiorna il timestamp
        this.conversationContexts[roomId].lastUpdateTime = new Date();
        
        // Aggiungi il messaggio alla conversazione
        this.conversationContexts[roomId].messages.push({ sender, text: message });
        
        // Mantieni solo gli ultimi 10 messaggi
        if (this.conversationContexts[roomId].messages.length > 10) {
            this.conversationContexts[roomId].messages.shift();
        }
        
        // Se è un messaggio dell'utente, estrai informazioni chiave e rileva l'argomento
        if (sender === 'user') {
            const keyInfo = this.keyInfoExtractor.extract(message);
            this.conversationContexts[roomId].keyInformation = {
                ...this.conversationContexts[roomId].keyInformation,
                ...keyInfo
            };
            
            // Aggiorna l'argomento solo se non è una domanda di follow-up
            if (!this.isFollowUpQuestion(message, roomId)) {
                this.conversationContexts[roomId].currentTopic = this.topicDetector.detect(message);
            }
        }
    }
    
    /**
     * Verifica se un messaggio è una domanda di follow-up
     */
    isFollowUpQuestion(message, roomId) {
        const lowerMessage = message.toLowerCase().trim();
        
        // Pattern comuni per domande di approfondimento
        const followUpPatterns = [
            /^altro\??$/i,
            /^e poi\??$/i,
            /^qualcos'altro\??$/i,
            /^cos'altro\??$/i,
            /^cosa altro\??$/i,
            /^e ancora\??$/i,
            /^continua\??$/i,
            /^di più\??$/i,
            /^ce ne sono altri\??$/i,
            /^e\??$/i,
            /^ancora\??$/i,
            /^dimmi di più\??$/i,
        ];
        
        // Se è una domanda breve che segue uno dei pattern
        if (followUpPatterns.some(pattern => pattern.test(lowerMessage))) {
            return true;
        }
        
        // Se la domanda è molto breve (meno di 10 caratteri) e contiene una parola specifica
        if (lowerMessage.length < 10 && 
            lowerMessage.match(/cosa|dove|come|quando|qual|chi|perché|altro/i)) {
            return true;
        }
        
        // Controlla se la risposta precedente del bot conteneva una domanda
        const context = this.getContext(roomId);
        const lastBotMessage = [...context.messages].reverse().find(msg => msg.sender === 'bot');
        
        if (lastBotMessage && lastBotMessage.text.includes('?')) {
            // Se la risposta dell'utente è breve, potrebbe essere una risposta alla domanda del bot
            return lowerMessage.length < 20;
        }
        
        return false;
    }
    
    /**
     * Pulisce i contesti di conversazione vecchi o inutilizzati
     */
    cleanupOldContexts() {
        const now = new Date();
        const maxAgeMsec = 24 * 60 * 60 * 1000; // 24 ore
        
        for (const [roomId, context] of Object.entries(this.conversationContexts)) {
            const ageMs = now - new Date(context.lastUpdateTime);
            if (ageMs > maxAgeMsec) {
                delete this.conversationContexts[roomId];
                console.log(`Rimosso contesto inattivo per stanza: ${roomId}`);
            }
        }
    }
}

module.exports = ContextManager;