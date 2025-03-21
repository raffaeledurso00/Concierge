const menu = require('../data/menu.json');
const attivita = require('../data/attivita.json');
const eventi = require('../data/eventi.json'); // Aggiunta questa linea
const MODEL_CONFIG = require('../config/modelConfig');
const axios = require('axios');

// Cache per le risposte semplici
const SIMPLE_RESPONSES = {
  'ciao': 'Salve! Come posso esserle utile oggi?',
  'salve': 'Salve! Come posso esserle utile oggi?',
  'buongiorno': 'Buongiorno! Come posso esserle utile oggi?',
  'buonasera': 'Buonasera! Come posso esserle utile oggi?',
  'grazie': 'Prego! Sono qui per qualsiasi altra necessità.',
  'arrivederci': 'Arrivederci! Le auguro una piacevole permanenza a Villa Petriolo.',
  'addio': 'Arrivederci! Le auguro una piacevole permanenza a Villa Petriolo.'
};

// Funzione per ottenere risposta semplice
const getSimpleResponse = (message) => {
  const lowerMessage = message.toLowerCase().trim();
  return SIMPLE_RESPONSES[lowerMessage] || null;
};

// Funzione per verificare se la domanda è pertinente
// Mantieni un registro delle ultime domande e risposte per ogni stanza
const conversationContexts = {};

// Migliora la funzione isRelevantQuestion per considerare il contesto
const isRelevantQuestion = (message, roomId = 'default-room') => {
  // Se è la prima domanda, usa la logica standard
  if (!conversationContexts[roomId] || conversationContexts[roomId].length === 0) {
    const relevantTopics = [
      /hotel|villa|petriolo|camera|stanza|servizi|wifi|parcheggio|check|reception/i,
      /menu|ristorante|pranzo|cena|colazione|prenotazione|tavolo|piatti|vino|bar/i,
      /attivit(a|à)|visita|tour|escursion|piscina|spa|massaggio|sport|tempo|meteo|eventi|event/i,
      /trasporto|taxi|transfer|bagagli|assistenza|emergenza|medico|farmacia/i
    ];
    return relevantTopics.some(topic => topic.test(message));
  }
  
  // Ottieni l'ultima risposta e domanda dalla cronologia
  const lastBotResponse = conversationContexts[roomId].filter(msg => msg.sender === 'bot').pop();
  
  // Se l'ultima risposta del bot conteneva una domanda o una richiesta di conferma
  if (lastBotResponse && (
      lastBotResponse.text.includes("?") || 
      lastBotResponse.text.includes("Preferite") || 
      lastBotResponse.text.includes("interessa")
     )) {
    return true; // Considera qualsiasi risposta come pertinente
  }
  
  // Se l'ultima risposta menzionava attività, passeggiate, ecc.
  if (lastBotResponse && (
      lastBotResponse.text.match(/passeggiata|tour|giardino|attivit|escursion/i)
     )) {
    // Se la risposta attuale è breve e potrebbe essere una preferenza
    if (message.length < 50 && message.match(/autonomo|guidat|preferis|si|no|vorrei|interessat/i)) {
      return true;
    }
  }
  
  // Altrimenti usa la logica standard
  const relevantTopics = [
    /hotel|villa|petriolo|camera|stanza|servizi|wifi|parcheggio|check|reception/i,
    /menu|ristorante|pranzo|cena|colazione|prenotazione|tavolo|piatti|vino|bar/i,
    /attivit(a|à)|visita|tour|escursion|piscina|spa|massaggio|sport|tempo|meteo|eventi|event/i,
    /trasporto|taxi|transfer|bagagli|assistenza|emergenza|medico|farmacia/i
  ];
  return relevantTopics.some(topic => topic.test(message));
};

// Nella funzione processMessage, aggiorna il contesto
exports.processMessage = async (req, res) => {
  try {
    const { message, roomId = 'default-room' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Il messaggio è richiesto' });
    }

    // Inizializza il contesto se non esiste
    if (!conversationContexts[roomId]) {
      conversationContexts[roomId] = [];
    }
    
    // Aggiungi la domanda dell'utente al contesto
    conversationContexts[roomId].push({ sender: 'user', text: message });
    
    // Mantieni solo le ultime 10 interazioni
    while (conversationContexts[roomId].length > 10) {
      conversationContexts[roomId].shift();
    }
    
    // Ottieni risposta considerando il contesto
    const result = await getOllamaResponse(message, roomId);
    
    // Aggiungi la risposta del bot al contesto
    conversationContexts[roomId].push({ sender: 'bot', text: result.response });
    
    res.json({ response: result.response, roomId });
  } catch (error) {
    console.error('Errore nel processamento del messaggio:', error);
    res.status(500).json({ 
      error: 'Si è verificato un errore nell\'elaborazione della richiesta',
      details: error.message 
    });
  }
};

// Modifica la risposta per domande sulle passeggiate autonome
const getOllamaResponse = async (message, roomId = 'default-room') => {
  try {
    // Controlla se la domanda è pertinente
    if (!isRelevantQuestion(message, roomId)) {
      return { 
        response: "Mi scuso, ma posso rispondere solo a domande relative ai servizi dell'hotel.",
        context: [] 
      };
    }
    
    // Recupera il contesto della conversazione
    const context = conversationContexts[roomId] || [];
    
    // Controlla se l'utente ha appena risposto a una domanda sulle passeggiate
    const lastBotMessage = context.filter(msg => msg.sender === 'bot').pop();
    const isAboutWalking = lastBotMessage && lastBotMessage.text.match(/passeggiata|tour|percorsi/i);
    
    // Se l'utente chiede qualcosa di autonomo dopo una domanda sulle passeggiate
    if (isAboutWalking && message.match(/autonomo|da soli|libero|senza guida/i)) {
      return { 
        response: "Perfetto! Per una passeggiata autonoma, vi consiglio i nostri percorsi segnalati nella tenuta. Abbiamo tre sentieri principali: il 'Sentiero degli Ulivi' (1,5 km, facile), il 'Percorso Panoramico' (3 km, moderato) e il 'Sentiero del Bosco' (4 km, moderato). Alla reception potete ritirare una mappa dettagliata con tutti i percorsi. Desiderate che vi prepariamo un cestino picnic da portare con voi durante la passeggiata?",
        context: [] 
      };
    }
    
    // Il resto del codice esistente...
    
    // Verifica il contesto della conversazione
    const isAboutWeather = conversationHistory[roomId].some(msg => 
      msg.match(/tempo|meteo|pioggia|sole|temperatura/i));
    
    // Risposta specifica per domande generiche dopo aver parlato del tempo o passeggiate
    if (message.match(/che altro|cosa possiamo fare|suggerimenti/i) && 
        (isAboutWeather || isAboutWalking)) {
      return { 
        response: "Se siete interessati a fare una passeggiata, posso suggerirvi il Tour del Giardino Botanico che si tiene ogni martedì, giovedì e domenica alle 10:30. In alternativa, offriamo anche passeggiate a cavallo nei dintorni (€60, 2 ore) o tour in bicicletta delle colline toscane (€35, 4 ore). Se preferite un'attività più rilassante, potrebbe interessarvi lo Yoga all'Alba o l'Aperitivo al Tramonto sulla nostra terrazza panoramica. Quale di queste attività vi interessa di più?",
        context: [] 
      };
    }
    // Controllo per risposte semplici e personalizzate
    const simpleResponse = getSimpleResponse(message);
    if (simpleResponse) return { response: simpleResponse, context: [] };

    // Controllo per richieste di menu specifiche
    if (message.toLowerCase().includes('menu')) {
      return {
        response: "Il nostro ristorante offre piatti tipici toscani. ANTIPASTI: Tagliere di salumi toscani (€16), Panzanella (€12). PRIMI: Pappardelle al cinghiale (€18), Risotto ai funghi porcini (€20). SECONDI: Bistecca alla fiorentina (€8/etto), Cinghiale in umido (€22). DOLCI: Cantucci con Vin Santo (€10), Tiramisù della casa (€9). Desidera prenotare un tavolo o ha altre domande?",
        context: []
      };
    }
    // Nel blocco di codice che gestisce le domande sul meteo:
    // Aggiungi al controller per gestire domande sul tempo
    if (message.toLowerCase().match(/tempo|meteo|pioggia|sole|temperatura/i) && 
        message.toLowerCase().match(/passeggiata|camminare|camminata|escursion/i)) {
      
      // Risposta predefinita completa che combina informazioni sul tempo e suggerimenti di attività
      return { 
        response: "Domani pomeriggio è previsto tempo soleggiato con poche nuvole, temperatura massima 22°C. Sarebbe perfetto per una passeggiata. Vi consiglio il nostro Tour del Giardino Botanico (disponibile martedì, giovedì e domenica), oppure la Passeggiata a Cavallo (€60, 2 ore) se desiderate un'esperienza più particolare. Abbiamo anche percorsi segnalati nella tenuta che potete esplorare liberamente. Preferite un'opzione guidata o autonoma?",
        context: [] 
      };
    }

    // Aggiungi gestione specifica per domande di follow-up dopo aver parlato del tempo
    if (message.toLowerCase().match(/che altro|cosa (possiamo|potremmo) fare|alternative|consigli/i) && 
        conversationHistory[roomId].some(msg => msg.match(/tempo|meteo|passeggiata|camminare/i))) {
      
      // Risposta predefinita per suggerimenti dopo aver parlato del tempo
      return { 
        response: "Oltre alle passeggiate, potete partecipare all'Aperitivo al Tramonto sulla nostra terrazza panoramica (disponibile venerdì e sabato, €25), oppure il Tour in Bicicletta delle colline circostanti (€35, 4 ore). Se preferite attività culturali, abbiamo in programma un Concerto Jazz sotto le Stelle il 22 aprile, o una Serata Degustazione Vini il 15 aprile. Quale di queste attività vi interessa maggiormente?",
        context: [] 
      };
    }
    
    // Controllo per richieste di eventi
    if (message.toLowerCase().match(/eventi|event/i)) {
      return {
        response: "A Villa Petriolo organizziamo diversi tipi di eventi. SPECIALI: Serata Degustazione Vini (15 aprile), Concerto Jazz sotto le Stelle (22 aprile), Cooking Class: Pasta Fresca (18 aprile). SETTIMANALI: Aperitivo al Tramonto (venerdì e sabato), Yoga all'Alba (lunedì, mercoledì, venerdì), Tour del Giardino Botanico (martedì, giovedì, domenica). STAGIONALI: Festival della Primavera (aprile-maggio), Vendemmia Partecipativa (settembre), Raccolto dell'Olivo (novembre). Quale evento le interessa maggiormente?",
        context: []
      };
    }

    if (!isRelevantQuestion(message)) {
      return { 
        response: "Mi scuso, ma posso rispondere solo a domande relative ai servizi dell'hotel.",
        context: [] 
      };
    }

    const relevantInfo = getRelevantInfo(message);
    const contextInfo = Object.keys(relevantInfo).length > 0 
      ? JSON.stringify(relevantInfo)
      : '';

    // Recupera il contesto esistente o usa un array vuoto
    const currentContext = conversationContexts[roomId] || [];

    console.log('URL completa prima della chiamata:', `${MODEL_CONFIG.baseUrl}${MODEL_CONFIG.apiPath}`);

    // Prova a fare la richiesta a Ollama con un timeout aumentato
    try {
      const response = await axios.post(
        `${MODEL_CONFIG.baseUrl}${MODEL_CONFIG.apiPath}`,
        {
          model: MODEL_CONFIG.name,
          prompt: `Sei il concierge di Villa Petriolo. Rispondi in modo breve e conciso. ${contextInfo ? 'Info: ' + contextInfo : ''} Q: ${message}`,
          context: currentContext,
          stream: false,
          ...MODEL_CONFIG.parameters
        },
        { timeout: 15000 } // Aumentato a 15 secondi
      );

      return { 
        response: response.data.response, 
        context: response.data.context || [] 
      };
    } catch (axiosError) {
      console.error('Errore nella chiamata ad Ollama:', axiosError);
      
      // Risposte di backup in caso di errori con Ollama
      if (message.toLowerCase().includes('attività') || message.toLowerCase().includes('attivita')) {
        return { 
          response: "A Villa Petriolo offriamo diverse attività: INTERNE: Degustazione di vini (€45, 2 ore), Corso di cucina toscana (€85, 3 ore), Accesso alla spa (€30, giornaliero). ESTERNE: Tour in bicicletta (€35, 4 ore), Passeggiata a cavallo (€60, 2 ore), Visita al frantoio (€15, 1 ora). ESCURSIONI: Tour di Firenze (€120, giornata intera), Degustazione in cantina locale (€75, mezza giornata). Quale le interessa di più?",
          context: [] 
        };
      }

      // Risposta generica di backup
      return { 
        response: "Come concierge di Villa Petriolo, sono qui per aiutarla con qualsiasi necessità. Posso fornirle informazioni sul nostro ristorante, sulle attività disponibili, sugli eventi organizzati o sui servizi della struttura. Come posso esserle utile oggi?",
        context: [] 
      };
    }
  } catch (error) {
    console.error('Errore generale:', error);
    return { 
      response: "Mi scuso, ma sto avendo problemi tecnici. Potrebbe riprovare tra poco?",
      context: [] 
    };
  }
};

// Funzione per processare i messaggi
exports.processMessage = async (req, res) => {
  try {
    const { message, roomId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Il messaggio è richiesto' });
    }

    // Usa l'ID stanza per mantenere il contesto per ogni utente
    const clientRoomId = roomId || 'default-room';
    
    const result = await getOllamaResponse(message, clientRoomId);
    
    res.json({ response: result.response, roomId: clientRoomId });

  } catch (error) {
    console.error('Errore nel processamento del messaggio:', error);
    res.status(500).json({ 
      error: 'Si è verificato un errore nell\'elaborazione della richiesta',
      details: error.message 
    });
  }
};