// backend/src/services/aiService.js
const axios = require('axios');
const MODEL_CONFIG = require('../config/modelConfig');
const menu = require('../data/menu.json');
const attivita = require('../data/attivita.json');
const eventi = require('../data/eventi.json');

/**
 * Servizio per la gestione delle interazioni con l'AI e del contesto conversazionale
 */
class AIService {
    constructor() {
        // Archivio di contesti delle conversazioni per stanza
        this.conversationContexts = {};
        
        // Definizione delle categorie di argomenti
        this.TOPIC_CATEGORIES = {
            MENU: 'menu',
            ATTIVITA: 'attivita',
            SERVIZI: 'servizi',
            EVENTI: 'eventi',
            METEO: 'meteo',
            GENERALE: 'generale'
        };
        
        // Risposte semplici per domande comuni
        this.SIMPLE_RESPONSES = {
            'ciao': 'Salve! Come posso esserle utile oggi?',
            'salve': 'Salve! Come posso esserle utile oggi?',
            'buongiorno': 'Buongiorno! Come posso esserle utile oggi?',
            'buonasera': 'Buonasera! Come posso esserle utile oggi?',
            'grazie': 'Prego! Sono qui per qualsiasi altra necessità.',
            'arrivederci': 'Arrivederci! Le auguro una piacevole permanenza a Villa Petriolo.',
            'addio': 'Arrivederci! Le auguro una piacevole permanenza a Villa Petriolo.'
        };
        
        // Espressioni toscane casuali per dare carattere alle risposte
        this.TOSCANA_EXPRESSIONS = [
            "Come diciamo in Toscana, 'chi ha tempo non aspetti tempo'!",
            "Sa, qui in Toscana diciamo che 'il vino fa buon sangue'.",
            "Come diciamo qui, 'andare a zonzo' tra le colline è un'esperienza imperdibile.",
            "In Toscana abbiamo un detto: 'val più la pratica della grammatica'.",
            "Come si dice qui, 'il contadino, scarpe grosse e cervello fino'."
        ];
        
        // Variazioni nelle chiusure delle risposte
        this.RESPONSE_CLOSINGS = [
            "Posso aiutarla con altro?",
            "C'è altro che le interessa?",
            "Ha altre domande?",
            "Desidera sapere altro su questo?",
            "Posso fornirle ulteriori dettagli?",
            "Le serve altro?"
        ];
    }
    
    /**
     * Estrae informazioni chiave dal messaggio dell'utente
     * @param {string} message - Il messaggio da analizzare
     * @returns {Object} - Informazioni estratte
     */
    extractKeyInformation(message) {
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
    
    /**
     * Aggiorna il contesto della conversazione con il nuovo messaggio
     * @param {string} roomId - ID della stanza/conversazione
     * @param {string} message - Il messaggio
     * @param {string} sender - Chi ha inviato il messaggio ('user' o 'bot')
     */
    updateConversationContext(roomId, message, sender) {
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
            const keyInfo = this.extractKeyInformation(message);
            this.conversationContexts[roomId].keyInformation = {
                ...this.conversationContexts[roomId].keyInformation,
                ...keyInfo
            };
            
            // Aggiorna l'argomento solo se non è una domanda di follow-up
            if (!this.isFollowUpQuestion(message, roomId)) {
                this.conversationContexts[roomId].currentTopic = this.detectTopic(message);
            }
        }
    }
    
    /**
     * Ottiene il contesto della conversazione per una stanza
     * @param {string} roomId - ID della stanza
     * @returns {Object} - Il contesto della conversazione
     */
    getConversationContext(roomId) {
        return this.conversationContexts[roomId] || { 
            messages: [],
            keyInformation: {},
            currentTopic: this.TOPIC_CATEGORIES.GENERALE,
            lastUpdateTime: new Date()
        };
    }
    
    /**
     * Verifica se un messaggio è una domanda di follow-up
     * @param {string} message - Il messaggio da verificare
     * @param {string} roomId - ID della stanza
     * @returns {boolean} - True se è una domanda di follow-up
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
        const context = this.getConversationContext(roomId);
        const lastBotMessage = [...context.messages].reverse().find(msg => msg.sender === 'bot');
        
        if (lastBotMessage && lastBotMessage.text.includes('?')) {
            // Se la risposta dell'utente è breve, potrebbe essere una risposta alla domanda del bot
            return lowerMessage.length < 20;
        }
        
        return false;
    }
    
    /**
     * Rileva l'argomento del messaggio
     * @param {string} message - Il messaggio da analizzare
     * @returns {string} - La categoria dell'argomento
     */
    detectTopic(message) {
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
        
        // Parole chiave per menu e ristorante
        const menuKeywords = ['menu', 'ristorante', 'pranzo', 'cena', 'colazione', 'piatti', 'cibo', 
                              'mangiare', 'bevande', 'vino', 'bere', 'prenotare tavolo', 'culinaria', 
                              'chef', 'specialità', 'degustazione'];
        
        // Parole chiave per attività
        const attivitaKeywords = ['attività', 'cosa fare', 'tour', 'escursione', 'passeggiata', 
                                 'camminata', 'visita', 'bicicletta', 'trekking', 'cavallo', 
                                 'piscina', 'spa', 'massaggio', 'yoga', 'corsi'];
        
        // Parole chiave per servizi
        const serviziKeywords = ['servizi', 'wifi', 'parcheggio', 'bagagli', 'assistenza', 
                                'reception', 'check-in', 'checkout', 'camera', 'pulizia', 
                                'navetta', 'transfer', 'orari', 'prenotazione'];
        
        // Parole chiave per eventi
        const eventiKeywords = ['eventi', 'concerti', 'programma', 'spettacoli', 'intrattenimento', 
                               'degustazione', 'festival', 'mostra', 'esposizione', 'calendario'];
        
        // Parole chiave per meteo
        const meteoKeywords = ['tempo', 'meteo', 'pioggia', 'sole', 'clima', 'temperatura', 
                             'previsioni', 'caldo', 'freddo', 'umidità'];
        
        // Calcola i punteggi per ogni categoria
        menuKeywords.forEach(keyword => {
            if (lowerMessage.includes(keyword)) {
                scores[this.TOPIC_CATEGORIES.MENU] += 1;
            }
        });
        
        attivitaKeywords.forEach(keyword => {
            if (lowerMessage.includes(keyword)) {
                scores[this.TOPIC_CATEGORIES.ATTIVITA] += 1;
            }
        });
        
        serviziKeywords.forEach(keyword => {
            if (lowerMessage.includes(keyword)) {
                scores[this.TOPIC_CATEGORIES.SERVIZI] += 1;
            }
        });
        
        eventiKeywords.forEach(keyword => {
            if (lowerMessage.includes(keyword)) {
                scores[this.TOPIC_CATEGORIES.EVENTI] += 1;
            }
        });
        
        meteoKeywords.forEach(keyword => {
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
    
    /**
     * Rileva l'intento del messaggio dell'utente
     * @param {string} message - Il messaggio
     * @returns {string} - L'intento rilevato
     */
    detectIntent(message) {
        // Normalizza il messaggio
        const normalizedMessage = message.toLowerCase();
        
        // Definisci gli intenti con pattern di riconoscimento
        const intents = [
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
        
        // Calcola la confidenza per ogni intento
        intents.forEach(intent => {
            intent.patterns.forEach(pattern => {
                if (pattern.test(normalizedMessage)) {
                    intent.confidence += 1;
                }
            });
        });
        
        // Ordina gli intenti per confidenza e prendi il più probabile
        const sortedIntents = [...intents].sort((a, b) => b.confidence - a.confidence);
        
        // Restituisci l'intento con confidenza più alta se supera una soglia
        return sortedIntents[0].confidence > 0 ? sortedIntents[0].name : 'general_inquiry';
    }
    
    /**
     * Ottiene informazioni contestuali basate sull'argomento
     * @param {string} topic - L'argomento
     * @returns {string} - Informazioni contestuali
     */
    getContextualInformation(topic) {
        let info = '';
        
        switch (topic) {
            case this.TOPIC_CATEGORIES.MENU:
                info = `
- L'utente sta chiedendo informazioni sul ristorante o sul cibo
- Il nostro ristorante si chiama "L'Olivaia" ed è aperto tutti i giorni dalle 12:30 alle 14:30 e dalle 19:30 alle 22:00
- Offriamo cucina toscana tradizionale con ingredienti biologici dalla nostra tenuta
- I piatti più popolari includono: bistecca alla fiorentina, pappardelle al cinghiale, e ribollita
- Abbiamo un'ottima selezione di vini toscani
- Offriamo opzioni per ospiti con esigenze alimentari speciali (vegetariani, vegani, celiaci)
- È consigliata la prenotazione per la cena`;
                break;
                
            case this.TOPIC_CATEGORIES.ATTIVITA:
                info = `
- L'utente è interessato alle attività disponibili
- Villa Petriolo offre diverse attività interne: degustazione di vini (€45), corso di cucina toscana (€85), accesso alla spa (€30)
- Attività esterne: tour in bicicletta (€35), passeggiata a cavallo (€60), visita al frantoio (€15)
- Organizziamo escursioni a Firenze, San Gimignano, Siena e alle cantine locali
- La maggior parte delle attività richiede prenotazione con 24 ore di anticipo
- Offriamo attività adatte a famiglie con bambini`;
                break;
                
            case this.TOPIC_CATEGORIES.SERVIZI:
                info = `
- L'utente sta chiedendo dei servizi dell'hotel
- Offriamo: WiFi gratuito in tutta la struttura, parcheggio gratuito, reception 24/7, servizio in camera
- Check-in dalle 14:00, check-out entro le 11:00
- Servizio navetta a pagamento da/per aeroporto e stazione
- Servizio lavanderia disponibile con consegna in 24 ore
- Noleggio biciclette, servizio baby-sitting su richiesta
- Assistenza per prenotazione di tour e attività fuori struttura`;
                break;
                
            case this.TOPIC_CATEGORIES.EVENTI:
                info = `
- L'utente vuole informazioni sugli eventi
- Eventi speciali: Serata Degustazione Vini (15 aprile), Concerto Jazz sotto le Stelle (22 aprile), Cooking Class: Pasta Fresca (18 aprile)
- Eventi settimanali: Aperitivo al Tramonto (venerdì e sabato), Yoga all'Alba (lunedì, mercoledì, venerdì), Tour del Giardino Botanico (martedì, giovedì, domenica)
- Eventi stagionali: Festival della Primavera (15 Aprile - 15 Maggio)
- La maggior parte degli eventi richiede prenotazione`;
                break;
                
            case this.TOPIC_CATEGORIES.METEO:
                info = `
- L'utente chiede informazioni sul meteo
- Il clima in Toscana è generalmente mite
- Primavera (marzo-maggio): temperature tra 10°C e 23°C, occasionali piogge
- Estate (giugno-agosto): caldo e soleggiato, temperature tra 18°C e 32°C
- Autunno (settembre-novembre): temperature tra 9°C e 25°C, più piovoso
- Inverno (dicembre-febbraio): temperature tra 4°C e 12°C
- Le previsioni per i prossimi giorni sono di tempo soleggiato con temperature massime di 24°C`;
                break;
                
            default:
                info = `
- Villa Petriolo è un agriturismo di lusso in Toscana
- Siamo situati in una zona tranquilla tra colline e uliveti
- Produciamo olio d'oliva e vino biologici
- Siamo a 30 minuti di auto da Firenze
- Le camere sono arredate in stile tradizionale toscano con comfort moderni
- Abbiamo una piscina all'aperto, una spa, e un ristorante con prodotti biologici`;
                break;
        }
        
        return info;
    }
    
    /**
     * Ottiene una risposta semplice per messaggi comuni
     * @param {string} message - Il messaggio
     * @returns {string|null} - La risposta semplice o null
     */
    getSimpleResponse(message) {
        const lowerMessage = message.toLowerCase().trim();
        return this.SIMPLE_RESPONSES[lowerMessage] || null;
    }
    
/**
 * Rende le risposte più naturali e pulisce il testo da caratteri problematici
 * @param {string} response - La risposta originale
 * @param {string} topic - L'argomento della conversazione
 * @returns {string} - La risposta naturalizzata
 */
naturalizeResponse(response, topic) {
    // Pulisci le parentesi vuote e altri caratteri problematici
    let naturalResponse = response;
    naturalResponse = naturalResponse.replace(/\(\s*\)/g, '');  // Rimuovi parentesi vuote
    naturalResponse = naturalResponse.replace(/\s{2,}/g, ' ');  // Riduci spazi multipli a uno solo
    
    // Sistema problemi comuni con la punteggiatura
    naturalResponse = naturalResponse.replace(/\,\s*\,/g, ',');  // Rimuovi virgole doppie
    naturalResponse = naturalResponse.replace(/\.\s*\./g, '.');  // Rimuovi punti doppi
    
    // Evita risposte troppo formali o rigide
    naturalResponse = naturalResponse.replace(/Mi permetta di informarla/g, "Posso dirle");
    naturalResponse = naturalResponse.replace(/Non esiti a contattarci/g, "Non esiti a chiedere");
    naturalResponse = naturalResponse.replace(/Desidero informarla/g, "Le faccio sapere");
    
    // Sistema i nomi delle sezioni per assicurare la formattazione corretta
    naturalResponse = naturalResponse.replace(/ANTIPASTI\s*:/g, "ANTIPASTI:");
    naturalResponse = naturalResponse.replace(/PRIMI\s*:/g, "PRIMI:");
    naturalResponse = naturalResponse.replace(/SECONDI\s*:/g, "SECONDI:");
    naturalResponse = naturalResponse.replace(/DOLCI\s*:/g, "DOLCI:");
    naturalResponse = naturalResponse.replace(/INTERNE\s*:/g, "INTERNE:");
    naturalResponse = naturalResponse.replace(/ESTERNE\s*:/g, "ESTERNE:");
    naturalResponse = naturalResponse.replace(/ESCURSIONI\s*:/g, "ESCURSIONI:");
    
    // Controlla che i prezzi siano formattati correttamente
    naturalResponse = naturalResponse.replace(/(\d+)\s*euro/gi, '€$1');
    naturalResponse = naturalResponse.replace(/€\s+(\d+)/g, '€$1');
    
    // Aggiungi espressioni toscane occasionali per dare carattere
    if (Math.random() > 0.9) {
        const randomExpression = this.TOSCANA_EXPRESSIONS[Math.floor(Math.random() * this.TOSCANA_EXPRESSIONS.length)];
        naturalResponse += " " + randomExpression;
    }
    
    // Aggiungi variazione nelle chiusure delle risposte
    const randomClosing = this.RESPONSE_CLOSINGS[Math.floor(Math.random() * this.RESPONSE_CLOSINGS.length)];
    
    // Se la risposta non termina già con una domanda, aggiungine una
    if (!naturalResponse.trim().endsWith("?")) {
        naturalResponse += " " + randomClosing;
    }
    
    return naturalResponse;
}
    /**
     * Genera un prompt ottimizzato per il modello LLM
     * @param {string} message - Il messaggio dell'utente
     * @param {string} roomId - ID della stanza
     * @returns {string} - Il prompt completo
     */
    generateEnhancedPrompt(message, roomId) {
        const context = this.getConversationContext(roomId);
        const previousMessages = context.messages
            .slice(-6) // Ultimi 6 messaggi per mantenere il contesto recente
            .map(msg => `${msg.sender === 'user' ? 'Ospite' : 'Concierge'}: ${msg.text}`)
            .join('\n');
        
        const currentTopic = context.currentTopic || this.TOPIC_CATEGORIES.GENERALE;
        const intent = this.detectIntent(message);
        
        // Costruisci un prompt personalizzato in base all'argomento e all'intento
        return `
Sei il concierge digitale di Villa Petriolo, un elegante agriturismo toscano. 
Rispondi in modo professionale, caloroso e personalizzato. Il tuo tono è sempre cortese e naturale.

### Contesto della conversazione:
${previousMessages}

### Informazioni rilevanti:
${this.getContextualInformation(currentTopic)}

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
     * Invia un messaggio al modello LLM
     * @param {string} prompt - Il prompt completo
     * @returns {Promise<string>} - La risposta del modello
     */
    async sendToLLM(prompt) {
        try {
            console.log('Invio prompt a Ollama');
            
            const response = await axios.post(
                `${MODEL_CONFIG.baseUrl}${MODEL_CONFIG.apiPath}`,
                {
                    model: MODEL_CONFIG.name,
                    prompt: prompt,
                    stream: false,
                    ...MODEL_CONFIG.parameters
                },
                { timeout: 15000 }
            );
            
            return response.data.response;
        } catch (error) {
            console.error('Errore nella chiamata ad Ollama:', error);
            throw error;
        }
    }
    
    /**
     * Processa un messaggio dell'utente e genera una risposta
     * @param {string} message - Il messaggio dell'utente
     * @param {string} roomId - ID della stanza
     * @returns {Promise<string>} - La risposta del concierge
     */
    async processMessage(message, roomId = 'default-room') {
        try {
            // Aggiorna il contesto con il messaggio dell'utente
            this.updateConversationContext(roomId, message, 'user');
            
            // Verifica se esiste una risposta semplice
            const simpleResponse = this.getSimpleResponse(message);
            if (simpleResponse) {
                this.updateConversationContext(roomId, simpleResponse, 'bot');
                return simpleResponse;
            }
            
            // Ottieni il contesto corrente
            const context = this.getConversationContext(roomId);
            
            // Genera un prompt avanzato per Ollama
            const enhancedPrompt = this.generateEnhancedPrompt(message, roomId);
            
            // Invia il prompt e ottieni la risposta
            const llmResponse = await this.sendToLLM(enhancedPrompt);
            
            // Naturalizza la risposta
            const naturalResponse = this.naturalizeResponse(llmResponse, context.currentTopic);
            
            // Aggiorna il contesto con la risposta del bot
            this.updateConversationContext(roomId, naturalResponse, 'bot');
            
            return naturalResponse;
        } catch (error) {
            console.error('Errore nel processare il messaggio:', error);
            
            // Gestione di fallback in caso di errore
            const fallbackResponse = this.generateFallbackResponse(roomId);
            this.updateConversationContext(roomId, fallbackResponse, 'bot');
            
            return fallbackResponse;
        }
    }
    
    /**
     * Genera una risposta di fallback basata sul contesto
     * @param {string} roomId - ID della stanza
     * @returns {string} - Una risposta di fallback appropriata
     */
    generateFallbackResponse(roomId) {
        const context = this.getConversationContext(roomId);
        
        switch (context.currentTopic) {
            case this.TOPIC_CATEGORIES.MENU:
                return "Il nostro ristorante offre piatti tipici toscani. ANTIPASTI: Tagliere di salumi toscani (€16), Panzanella (€12). PRIMI: Pappardelle al cinghiale (€18), Risotto ai funghi porcini (€20). SECONDI: Bistecca alla fiorentina (€8/etto), Cinghiale in umido (€22). DOLCI: Cantucci con Vin Santo (€10), Tiramisù della casa (€9). Desidera altre informazioni o vorrebbe prenotare un tavolo?";
                
            case this.TOPIC_CATEGORIES.ATTIVITA:
                return "A Villa Petriolo offriamo diverse attività: INTERNE: Degustazione di vini (€45, 2 ore), Corso di cucina toscana (€85, 3 ore), Accesso alla spa (€30, giornaliero). ESTERNE: Tour in bicicletta (€35, 4 ore), Passeggiata a cavallo (€60, 2 ore), Visita al frantoio (€15, 1 ora). Quale attività le interessa maggiormente?";
                
            case this.TOPIC_CATEGORIES.EVENTI:
                return "Ecco alcuni eventi in programma: SPECIALI: Serata Degustazione Vini (15 aprile), Concerto Jazz sotto le Stelle (22 aprile). SETTIMANALI: Aperitivo al Tramonto (venerdì e sabato), Yoga all'Alba (lunedì, mercoledì, venerdì). Le interessa qualcuno di questi eventi?";
                
            default:
                return "Come concierge di Villa Petriolo, sono qui per aiutarla con qualsiasi necessità riguardante il suo soggiorno. Posso fornirle informazioni sul nostro ristorante, sulle attività disponibili o sui servizi della struttura. Come posso esserle utile oggi?";
        }
    }
    
    /**
     * Pulisce i contesti di conversazione vecchi o inutilizzati
     * Questa funzione può essere chiamata periodicamente
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

module.exports = new AIService();