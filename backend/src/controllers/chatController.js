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

// Add isRelevantQuestion function
const isRelevantQuestion = (message) => {
  const relevantTopics = [
    /hotel|villa|petriolo|camera|stanza|servizi|wifi|parcheggio|check|reception/i,
    /menu|ristorante|pranzo|cena|colazione|prenotazione|tavolo|piatti|vino|bar/i,
    /attivit(a|à)|visita|tour|escursion|piscina|spa|massaggio|sport|tempo|meteo/i,
    /trasporto|taxi|transfer|bagagli|assistenza|emergenza|medico|farmacia/i
  ];
  return relevantTopics.some(topic => topic.test(message));
};

// Add getRelevantInfo function
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

const getSimpleResponse = (message) => {
  const lowerMessage = message.toLowerCase().trim();
  return SIMPLE_RESPONSES[lowerMessage] || null;
};


const getOllamaResponse = async (message, context) => {
  try {
    const simpleResponse = getSimpleResponse(message);
    if (simpleResponse) return simpleResponse;

    if (!isRelevantQuestion(message)) {
      return "Mi scuso, ma posso rispondere solo a domande relative ai servizi dell'hotel.";
    }

    const relevantInfo = getRelevantInfo(message);
    const contextInfo = Object.keys(relevantInfo).length > 0 
      ? JSON.stringify(relevantInfo)
      : '';

    const response = await axios.post(
      `${MODEL_CONFIG.baseUrl}${MODEL_CONFIG.apiPath}`,
      {
        model: MODEL_CONFIG.name,
        prompt: `Sei il concierge di Villa Petriolo. ${contextInfo ? 'Info: ' + contextInfo : ''} Q: ${message}`,
        context: context || [],
        stream: false,
        ...MODEL_CONFIG.parameters
      },
      { timeout: 5000 }
    );

    return response.data.response;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return "Mi scuso per l'attesa. Potrebbe riformulare la domanda in modo più conciso?";
    }
    console.error('Errore Ollama:', error);
    return "Mi scuso, ma sto avendo problemi tecnici. Potrebbe riprovare tra poco?";
  }
};

exports.processMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Il messaggio è richiesto' });
    }

    const response = await getOllamaResponse(message);
    res.json({ response });

  } catch (error) {
    console.error('Errore nel processamento del messaggio:', error);
    res.status(500).json({ 
      error: 'Si è verificato un errore nell\'elaborazione della richiesta',
      details: error.message 
    });
  }
};