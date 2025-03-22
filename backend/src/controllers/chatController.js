// Miglioramento al file backend/src/controllers/chatController.js
const menu = require('../data/menu.json');
const attivita = require('../data/attivita.json');
const eventi = require('../data/eventi.json');
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

// Mantieni un registro delle conversazioni per stanza
const conversationContexts = {};

// Nuova struttura per tenere traccia dell'argomento corrente della conversazione
const conversationTopics = {};

// Funzione per ottenere risposta semplice
const getSimpleResponse = (message) => {
  const lowerMessage = message.toLowerCase().trim();
  return SIMPLE_RESPONSES[lowerMessage] || null;
};

// Categorie di argomenti per classificare le conversazioni
const TOPIC_CATEGORIES = {
  MENU: 'menu',
  ATTIVITA: 'attivita',
  SERVIZI: 'servizi',
  EVENTI: 'eventi',
  METEO: 'meteo',
  GENERALE: 'generale'
};

// Riconosce l'argomento in base al messaggio
const detectTopic = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.match(/menu|ristorante|pranzo|cena|colazione|piatti|cibo|mangiare|bevande|vino|bere/i)) {
    return TOPIC_CATEGORIES.MENU;
  }
  
  if (lowerMessage.match(/attivit(a|à)|cosa fare|tour|escursion|passeggiata|camminata|visita|bicicletta/i)) {
    return TOPIC_CATEGORIES.ATTIVITA;
  }
  
  if (lowerMessage.match(/servizi|wifi|parcheggio|bagagli|assistenza|reception|check-in|checkout|camera|pulizia/i)) {
    return TOPIC_CATEGORIES.SERVIZI;
  }
  
  if (lowerMessage.match(/eventi|concerti|programma|spettacoli|intrattenimento|degustazione/i)) {
    return TOPIC_CATEGORIES.EVENTI;
  }
  
  if (lowerMessage.match(/tempo|meteo|pioggia|sole|clima|temperatura/i)) {
    return TOPIC_CATEGORIES.METEO;
  }
  
  return TOPIC_CATEGORIES.GENERALE;
};

// Verifica se una domanda è una richiesta di approfondimento basata sul contesto
const isFollowUpQuestion = (message, roomId) => {
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
  
  return false;
};

// Funzione per verificare se la domanda è pertinente
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
  
  // Se è una domanda di approfondimento, è sempre pertinente
  if (isFollowUpQuestion(message, roomId)) {
    return true;
  }
  
  // Ottieni l'ultima risposta del bot dalla cronologia
  const lastBotResponse = conversationContexts[roomId]
    .filter(msg => msg.sender === 'bot')
    .pop();
  
  // Se l'ultima risposta del bot conteneva una domanda o una richiesta di conferma
  if (lastBotResponse && (
      lastBotResponse.text.includes("?") || 
      lastBotResponse.text.includes("Preferite") || 
      lastBotResponse.text.includes("interessa")
     )) {
    return true; // Considera qualsiasi risposta come pertinente
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

// Funzione per ottenere dati rilevanti basati sull'argomento attuale
const getContextualData = (topic, previousResponses = []) => {
  let data = {};
  
  // Controlla quali categorie di dati sono già state mostrate
  const hasShownAntipasti = previousResponses.some(r => r.includes("ANTIPASTI:"));
  const hasShownPrimi = previousResponses.some(r => r.includes("PRIMI:"));
  const hasShownSecondi = previousResponses.some(r => r.includes("SECONDI:"));
  const hasShownDolci = previousResponses.some(r => r.includes("DOLCI:"));
  
  const hasShownAttivitaInterne = previousResponses.some(r => r.includes("INTERNE:"));
  const hasShownAttivitaEsterne = previousResponses.some(r => r.includes("ESTERNE:"));
  const hasShownEscursioni = previousResponses.some(r => r.includes("ESCURSIONI:"));
  
  const hasShownEventiSpeciali = previousResponses.some(r => r.includes("SPECIALI:"));
  const hasShownEventiSettimanali = previousResponses.some(r => r.includes("SETTIMANALI:"));
  
  switch (topic) {
    case TOPIC_CATEGORIES.MENU:
      // Restituisci parti del menu non ancora mostrate o un approfondimento
      if (!hasShownAntipasti) {
        data.menuSection = 'antipasti';
        data.items = menu.antipasti;
      } else if (!hasShownPrimi) {
        data.menuSection = 'primi';
        data.items = menu.primi;
      } else if (!hasShownSecondi) {
        data.menuSection = 'secondi';
        data.items = menu.secondi;
      } else if (!hasShownDolci) {
        data.menuSection = 'dolci';
        data.items = menu.dolci;
      } else {
        // Se tutte le sezioni sono state mostrate, offri un suggerimento personalizzato
        data.customSuggestion = true;
      }
      break;
      
    case TOPIC_CATEGORIES.ATTIVITA:
      if (!hasShownAttivitaInterne) {
        data.attivitaSection = 'interne';
        data.items = attivita.attivitaInterne;
      } else if (!hasShownAttivitaEsterne) {
        data.attivitaSection = 'esterne';
        data.items = attivita.attivitaEsterne;
      } else if (!hasShownEscursioni) {
        data.attivitaSection = 'escursioni';
        data.items = attivita.escursioni;
      } else {
        data.customSuggestion = true;
      }
      break;
      
    case TOPIC_CATEGORIES.EVENTI:
      if (!hasShownEventiSpeciali) {
        data.eventiSection = 'speciali';
        data.items = eventi.eventi_speciali;
      } else if (!hasShownEventiSettimanali) {
        data.eventiSection = 'settimanali';
        data.items = eventi.eventi_settimanali;
      } else {
        data.eventiSection = 'stagionali';
        data.items = eventi.eventi_stagionali;
      }
      break;
      
    default:
      break;
  }
  
  return data;
};

// Funzione per generare una risposta contestuale basata sull'argomento corrente
const generateContextualResponse = (roomId, message) => {
  if (!conversationTopics[roomId]) {
    return null;
  }
  
  const currentTopic = conversationTopics[roomId];
  const previousResponses = conversationContexts[roomId]
    .filter(msg => msg.sender === 'bot')
    .map(msg => msg.text);
  
  // Se è una domanda di approfondimento
  if (isFollowUpQuestion(message, roomId)) {
    const contextData = getContextualData(currentTopic, previousResponses);
    
    // Risposte per il menu
    if (currentTopic === TOPIC_CATEGORIES.MENU) {
      if (contextData.menuSection === 'antipasti') {
        return "Per gli ANTIPASTI offriamo anche: Bruschetta con pomodorini e basilico (€10), Carpaccio di manzo con scaglie di parmigiano (€14). Vuole sapere dei primi piatti?";
      } else if (contextData.menuSection === 'primi') {
        return "Tra i PRIMI piatti abbiamo anche: Tagliatelle ai funghi porcini (€16), Gnocchi al ragù di chianina (€15), Zuppa di farro toscana (€14). Desidera conoscere i secondi piatti?";
      } else if (contextData.menuSection === 'secondi') {
        return "Come SECONDI abbiamo anche: Tagliata di manzo con rucola e grana (€24), Coniglio alla cacciatora (€20), Filetto di branzino alle erbe (€26). Posso mostrarle i nostri dolci?";
      } else if (contextData.menuSection === 'dolci') {
        return "Per i DOLCI proponiamo anche: Crostata di frutta fresca (€8), Panna cotta ai frutti di bosco (€7), Semifreddo al pistacchio (€9). Posso aiutarla con una prenotazione al nostro ristorante?";
      } else if (contextData.customSuggestion) {
        return "Le consiglio di provare il nostro menu degustazione a €55 che include una selezione dei migliori piatti dello chef. Abbiamo anche un'ottima carta dei vini con etichette toscane selezionate. Desidera prenotare un tavolo?";
      }
    }
    
    // Risposte per le attività
    else if (currentTopic === TOPIC_CATEGORIES.ATTIVITA) {
      if (contextData.attivitaSection === 'interne') {
        return "Oltre alle attività già menzionate, offriamo anche lezioni di yoga all'alba (€25, 1 ora), degustazione di olio d'oliva (€30, 1.5 ore) e serate di musica dal vivo nel weekend. Preferisce attività all'interno della struttura o all'aperto?";
      } else if (contextData.attivitaSection === 'esterne') {
        return "Per le attività all'aperto abbiamo anche: trekking guidato nelle colline (€25, 3 ore), corsi di fotografia paesaggistica (€40, 2 ore), e picnic nei nostri vigneti (€30 per persona). Le interessa qualcuna di queste?";
      } else if (contextData.attivitaSection === 'escursioni') {
        return "Organizziamo anche escursioni a San Gimignano (€85, mezza giornata), tour di Siena con degustazione di Chianti (€110, giornata intera) e visite alle terme naturali di Petriolo (€65, mezza giornata). Quale preferisce?";
      } else if (contextData.customSuggestion) {
        return "Per un'esperienza davvero speciale, le consiglio il nostro pacchetto 'Vita Toscana' che include una lezione di cucina, degustazione di vini e un tour personalizzato delle nostre tenute. È disponibile a €150 per persona. Posso prenotarlo per lei?";
      }
    }
    
    // Risposte per gli eventi
    else if (currentTopic === TOPIC_CATEGORIES.EVENTI) {
      if (contextData.eventiSection === 'speciali') {
        return "In aggiunta agli eventi speciali già menzionati, il 20 aprile avremo una Masterclass di Cucina con lo Chef stellato Marco Bartolini (€120), e il 25 aprile una Degustazione Verticale di vini Brunello (€85). Quale le interessa di più?";
      } else if (contextData.eventiSection === 'settimanali') {
        return "Tra gli altri eventi settimanali abbiamo: Pilates nel Parco (martedì e giovedì, €15), Degustazione di Oli (mercoledì, €20) e Cinema sotto le Stelle (sabato, €10 con aperitivo incluso). Posso fornirle ulteriori dettagli?";
      } else if (contextData.eventiSection === 'stagionali') {
        return "Per l'estate abbiamo in programma il Festival della Musica Classica (giugno-luglio) con concerti settimanali nella nostra limonaia, e Serate Astronomiche (agosto) con osservazione delle stelle guidata da esperti. Desidera essere aggiornato su questi eventi?";
      }
    }
    
    // Risposte per il meteo
    else if (currentTopic === TOPIC_CATEGORIES.METEO) {
      return "Per i prossimi giorni è previsto tempo prevalentemente soleggiato con temperature massime intorno ai 24°C. Ideale per passeggiate nei dintorni o per godere della nostra piscina all'aperto. Desidera che le suggerisca attività adatte a questo clima?";
    }
    
    // Risposte per i servizi
    else if (currentTopic === TOPIC_CATEGORIES.SERVIZI) {
      return "Offriamo anche servizio in camera 24/7, noleggio biciclette (€15 al giorno), parcheggio gratuito, servizio lavanderia e stireria, e possibilità di organizzare transfer privati da/per aeroporti e stazioni. C'è un servizio particolare di cui ha bisogno?";
    }
  }
  
  return null;
};

// Gestione delle richieste di messaggio
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
    
    // Controlla risposta semplice
    const simpleResponse = getSimpleResponse(message);
    if (simpleResponse) {
      // Aggiungi la risposta al contesto
      conversationContexts[roomId].push({ sender: 'bot', text: simpleResponse });
      return res.json({ response: simpleResponse, roomId });
    }
    
    // Rileva l'argomento se è una nuova domanda (non di approfondimento)
    if (!isFollowUpQuestion(message, roomId)) {
      const detectedTopic = detectTopic(message);
      conversationTopics[roomId] = detectedTopic;
    }
    
    // Verifica se possiamo generare una risposta contestuale
    const contextualResponse = generateContextualResponse(roomId, message);
    if (contextualResponse) {
      // Aggiungi la risposta al contesto
      conversationContexts[roomId].push({ sender: 'bot', text: contextualResponse });
      return res.json({ response: contextualResponse, roomId });
    }
    
    // Verifica se la domanda è pertinente
    if (!isRelevantQuestion(message, roomId)) {
      const notRelevantResponse = "Mi scuso, ma posso rispondere solo a domande relative ai servizi dell'hotel.";
      conversationContexts[roomId].push({ sender: 'bot', text: notRelevantResponse });
      return res.json({ response: notRelevantResponse, roomId });
    }
    
    // Prepara il contesto per la chiamata a Ollama
    const previousMessages = conversationContexts[roomId]
      .slice(-4) // Ultimi 4 messaggi per mantenere il contesto recente
      .map(msg => `${msg.sender === 'user' ? 'Utente' : 'Concierge'}: ${msg.text}`)
      .join('\n');
    
    // Determina l'argomento attuale
    const currentTopic = conversationTopics[roomId] || TOPIC_CATEGORIES.GENERALE;
    
    // Crea un prompt migliorato per Ollama
    const enhancedPrompt = `
Sei il concierge digitale di Villa Petriolo. Rispondi in modo cortese, conciso ed empatico.

CONTESTO DELLA CONVERSAZIONE:
${previousMessages}

INFORMAZIONI RILEVANTI:
- Argomento attuale: ${currentTopic}
${currentTopic === TOPIC_CATEGORIES.MENU ? '- L\'utente sta chiedendo informazioni sul menu' : ''}
${currentTopic === TOPIC_CATEGORIES.ATTIVITA ? '- L\'utente è interessato alle attività disponibili' : ''}
${currentTopic === TOPIC_CATEGORIES.EVENTI ? '- L\'utente vuole sapere degli eventi' : ''}
${currentTopic === TOPIC_CATEGORIES.SERVIZI ? '- L\'utente chiede dei servizi dell\'hotel' : ''}

ISTRUZIONI:
1. Mantieni la continuità della conversazione
2. Fornisci informazioni precise e utili
3. Se l'utente chiede "altro?" o fa domande brevi, continua a parlare dell'argomento corrente
4. Offri sempre opzioni correlate o suggerimenti aggiuntivi
5. Concludi con una domanda per mantenere la conversazione fluida

Domanda dell'utente: ${message}
`;
    
    // Prova a fare la richiesta a Ollama con un timeout aumentato
    try {
      console.log('URL completa prima della chiamata:', `${MODEL_CONFIG.baseUrl}${MODEL_CONFIG.apiPath}`);
      
      const response = await axios.post(
        `${MODEL_CONFIG.baseUrl}${MODEL_CONFIG.apiPath}`,
        {
          model: MODEL_CONFIG.name,
          prompt: enhancedPrompt,
          stream: false,
          ...MODEL_CONFIG.parameters
        },
        { timeout: 15000 } // Aumentato a 15 secondi
      );

      const botResponse = response.data.response;
      
      // Aggiungi la risposta al contesto
      conversationContexts[roomId].push({ sender: 'bot', text: botResponse });
      
      res.json({ response: botResponse, roomId });
    } catch (axiosError) {
      console.error('Errore nella chiamata ad Ollama:', axiosError);
      
      // Risposte di backup in caso di errori con Ollama
      let fallbackResponse = '';
      
      if (currentTopic === TOPIC_CATEGORIES.MENU) {
        fallbackResponse = "Il nostro ristorante offre piatti tipici toscani. ANTIPASTI: Tagliere di salumi toscani (€16), Panzanella (€12). PRIMI: Pappardelle al cinghiale (€18), Risotto ai funghi porcini (€20). SECONDI: Bistecca alla fiorentina (€8/etto), Cinghiale in umido (€22). DOLCI: Cantucci con Vin Santo (€10), Tiramisù della casa (€9). Desidera altre informazioni o vorrebbe prenotare un tavolo?";
      } else if (currentTopic === TOPIC_CATEGORIES.ATTIVITA) {
        fallbackResponse = "A Villa Petriolo offriamo diverse attività: INTERNE: Degustazione di vini (€45, 2 ore), Corso di cucina toscana (€85, 3 ore), Accesso alla spa (€30, giornaliero). ESTERNE: Tour in bicicletta (€35, 4 ore), Passeggiata a cavallo (€60, 2 ore), Visita al frantoio (€15, 1 ora). Quale attività le interessa maggiormente?";
      } else if (currentTopic === TOPIC_CATEGORIES.EVENTI) {
        fallbackResponse = "Ecco alcuni eventi in programma: SPECIALI: Serata Degustazione Vini (15 aprile), Concerto Jazz sotto le Stelle (22 aprile). SETTIMANALI: Aperitivo al Tramonto (venerdì e sabato), Yoga all'Alba (lunedì, mercoledì, venerdì). Le interessa qualcuno di questi eventi?";
      } else {
        fallbackResponse = "Come concierge di Villa Petriolo, sono qui per aiutarla con qualsiasi necessità riguardante il suo soggiorno. Posso fornirle informazioni sul nostro ristorante, sulle attività disponibili o sui servizi della struttura. Come posso esserle utile oggi?";
      }
      
      // Aggiungi la risposta al contesto
      conversationContexts[roomId].push({ sender: 'bot', text: fallbackResponse });
      
      res.json({ response: fallbackResponse, roomId });
    }
  } catch (error) {
    console.error('Errore generale:', error);
    const errorResponse = "Mi scuso, ma sto avendo problemi tecnici. Potrebbe riprovare tra poco?";
    res.json({ response: errorResponse, roomId: req.body.roomId || 'default-room' });
  }
};