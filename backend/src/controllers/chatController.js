// backend/src/controllers/chatController.js

const menu = require('../data/menu.json');
const attivita = require('../data/attivita.json');
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
const isRelevantQuestion = (message) => {
  const relevantTopics = [
    /hotel|villa|petriolo|camera|stanza|servizi|wifi|parcheggio|check|reception/i,
    /menu|ristorante|pranzo|cena|colazione|prenotazione|tavolo|piatti|vino|bar/i,
    /attivit(a|à)|visita|tour|escursion|piscina|spa|massaggio|sport|tempo|meteo/i,
    /trasporto|taxi|transfer|bagagli|assistenza|emergenza|medico|farmacia/i
  ];
  return relevantTopics.some(topic => topic.test(message));
};

// Funzione per ottenere informazioni rilevanti
const getRelevantInfo = (message) => {
  const info = {};
  if (message.match(/menu|ristorante|pranzo|cena|colazione|piatti|vino/i)) {
    info.menu = menu;
  }
  if (message.match(/attivit|tour|escursion|piscina|spa|massaggio|sport/i)) {
    info.attivita = attivita;
  }
  return info;
};

// Cache per i contesti di conversazione
const conversationContexts = {};

// Funzione per ottenere risposta da Ollama
// Aumenta il timeout della richiesta
const getOllamaResponse = async (message, roomId = 'default-room') => {
  try {
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
        response: "Come concierge di Villa Petriolo, sono qui per aiutarla con qualsiasi necessità. Posso fornirle informazioni sul nostro ristorante, sulle attività disponibili o sui servizi della struttura. Come posso esserle utile oggi?",
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