// backend/src/services/ai/AIService.js
const ContextManager = require('./ContextManager');
const TopicDetector = require('./TopicDetector');
const ResponseGenerator = require('./ResponseGenerator');
const ResponseNaturalizer = require('./ResponseNaturalizer');
const IntentDetector = require('./IntentDetector');
const KeyInfoExtractor = require('./KeyInfoExtractor');
const LLMConnector = require('./LLMConnector');

/**
 * Servizio principale per la gestione delle interazioni con l'AI
 */
class AIService {
    constructor() {
        this.contextManager = new ContextManager();
        this.topicDetector = new TopicDetector();
        this.responseGenerator = new ResponseGenerator();
        this.responseNaturalizer = new ResponseNaturalizer();
        this.intentDetector = new IntentDetector();
        this.keyInfoExtractor = new KeyInfoExtractor();
        this.llmConnector = new LLMConnector();
        
        // Definizione delle categorie di argomenti
        this.TOPIC_CATEGORIES = {
            MENU: 'menu',
            ATTIVITA: 'attivita',
            SERVIZI: 'servizi',
            EVENTI: 'eventi',
            METEO: 'meteo',
            GENERALE: 'generale'
        };
    }
    
    /**
     * Processa un messaggio dell'utente e genera una risposta
     */
    async processMessage(message, roomId = 'default-room') {
        try {
            // Aggiorna il contesto con il messaggio dell'utente
            this.contextManager.updateConversation(roomId, message, 'user');
            
            // Verifica se esiste una risposta semplice
            const simpleResponse = this.responseGenerator.getSimpleResponse(message);
            if (simpleResponse) {
                this.contextManager.updateConversation(roomId, simpleResponse, 'bot');
                return simpleResponse;
            }
            
            // Ottieni il contesto corrente
            const context = this.contextManager.getContext(roomId);
            
            // Genera un prompt avanzato per Ollama
            const enhancedPrompt = this.generateEnhancedPrompt(message, roomId);
            
            // Invia il prompt e ottieni la risposta
            const llmResponse = await this.llmConnector.sendPrompt(enhancedPrompt);
            
            // Naturalizza la risposta
            const naturalResponse = this.responseNaturalizer.naturalizeResponse(llmResponse, context.currentTopic);
            
            // Aggiorna il contesto con la risposta del bot
            this.contextManager.updateConversation(roomId, naturalResponse, 'bot');
            
            return naturalResponse;
        } catch (error) {
            console.error('Errore nel processare il messaggio:', error);
            
            // Gestione di fallback in caso di errore
            const fallbackResponse = this.responseGenerator.generateFallbackResponse(
                this.contextManager.getContext(roomId).currentTopic
            );
            this.contextManager.updateConversation(roomId, fallbackResponse, 'bot');
            
            return fallbackResponse;
        }
    }
    
    /**
     * Genera un prompt ottimizzato per il modello LLM
     */
    generateEnhancedPrompt(message, roomId) {
        const context = this.contextManager.getContext(roomId);
        const previousMessages = context.messages
            .slice(-6) // Ultimi 6 messaggi per mantenere il contesto recente
            .map(msg => `${msg.sender === 'user' ? 'Ospite' : 'Concierge'}: ${msg.text}`)
            .join('\n');
        
        const currentTopic = context.currentTopic || this.TOPIC_CATEGORIES.GENERALE;
        const intent = this.intentDetector.detectIntent(message);
        
        // Costruisci un prompt personalizzato in base all'argomento e all'intento
        return `
Sei il concierge digitale di Villa Petriolo, un elegante agriturismo toscano. 
Rispondi in modo professionale, caloroso e personalizzato. Il tuo tono è sempre cortese e naturale.

### Contesto della conversazione:
${previousMessages}

### Informazioni rilevanti:
${this.responseGenerator.getContextualInformation(currentTopic)}

### Informazioni sull'ospite:
${Object.entries(context.keyInformation).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

### L'argomento attuale è: ${currentTopic}
### L'intento rilevato è: ${intent}

### Il tuo stile:
- Sii dettagliato ma conciso
- Usa un linguaggio naturale, evitando formule troppo ripetitive
- Includi sempre una domanda di follow-up pertinente per mantenere viva la conversazione
- Se menzionato cibo o attività, offri sempre un consiglio personale ("Vi consiglio particolarmente...")
- Adatta il tuo tono in base a ciò che chiede l'ospite

### Domanda dell'ospite:
${message}
`;
    }
    
    /**
     * Pulisce i contesti di conversazione vecchi o inutilizzati
     */
    cleanupOldContexts() {
        this.contextManager.cleanupOldContexts();
    }
    
    /**
     * Genera una risposta di fallback
     */
    generateFallbackResponse(roomId) {
        const context = this.contextManager.getContext(roomId);
        return this.responseGenerator.generateFallbackResponse(context.currentTopic);
    }
}

module.exports = AIService;