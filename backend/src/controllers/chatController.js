const menu = require('../data/menu.json');
const attivita = require('../data/attivita.json');

// Memorizziamo l'ultimo intento per ogni utente
const sessionContext = {};

// Funzione per ottenere una risposta casuale da un array
const getRandomResponse = (responses) => {
  const index = Math.floor(Math.random() * responses.length);
  return responses[index];
};

// Sistema di intenti migliorato
const intents = [
  {
    name: 'saluto',
    priority: 1,
    patterns: ['ciao', 'salve', 'buongiorno', 'buonasera', 'hey', 'saluti'],
    responses: [
      "Benvenuto a Villa Petriolo! Sono il tuo concierge digitale. Posso aiutarti con informazioni sul nostro ristorante, attività disponibili o servizi della struttura. Come posso esserti utile oggi?",
      "Salve! Come posso rendere il tuo soggiorno a Villa Petriolo più piacevole oggi?",
      "Buongiorno! Sono qui per aiutarti con qualsiasi informazione sulla villa e i servizi disponibili."
    ]
  },
  {
    name: 'menu_completo',
    priority: 4,
    patterns: ['menu completo', 'tutti i piatti', 'elenco piatti', 'carta completa'],
    response: (message) => {
      let menuCompleto = "MENU DI VILLA PETRIOLO\n\n";
      
      // Antipasti
      menuCompleto += "ANTIPASTI\n";
      menu.antipasti.forEach(piatto => {
        menuCompleto += `• ${piatto.nome} ${piatto.prezzo}€\n`;
      });
      
      menuCompleto += "\n";
      
      // Primi
      menuCompleto += "PRIMI PIATTI\n";
      menu.primi.forEach(piatto => {
        menuCompleto += `• ${piatto.nome} ${piatto.prezzo}€\n`;
      });
      
      menuCompleto += "\n";
      
      // Secondi
      menuCompleto += "SECONDI PIATTI\n";
      menu.secondi.forEach(piatto => {
        if (piatto.prezzoperetto) {
          menuCompleto += `• ${piatto.nome} ${piatto.prezzo}€ all'etto\n`;
        } else {
          menuCompleto += `• ${piatto.nome} ${piatto.prezzo}€\n`;
        }
      });
      
      menuCompleto += "\n";
      
      // Dolci
      menuCompleto += "DOLCI\n";
      menu.dolci.forEach(piatto => {
        menuCompleto += `• ${piatto.nome} ${piatto.prezzo}€\n`;
      });
      
      menuCompleto += "\nPosso aiutarti a scegliere o vuoi informazioni su qualche piatto in particolare?";
      
      return menuCompleto;
    }
},
  {
    name: 'menu_info',
    priority: 2,
    patterns: ['menu', 'ristorante', 'mangiare', 'cibo', 'piatti', 'pranzo', 'colazione', 'cena'],
    keyPhrases: ['cosa mangiare', 'cosa c\'è da mangiare', 'cosa offre il ristorante', 'specialità del ristorante'],
    responses: [
      "Il nostro ristorante offre diversi piatti della tradizione toscana. Tra gli antipasti abbiamo il Tagliere di salumi toscani (16€) e la Panzanella (12€). Tra i primi piatti ti consiglio le Pappardelle al cinghiale (18€) o il Risotto ai funghi porcini (20€). Come secondo, la nostra Bistecca alla fiorentina è rinomata. Desideri vedere il menu completo?",
      "Il menu del nostro ristorante celebra i sapori toscani con ingredienti locali e di stagione. Abbiamo antipasti tradizionali, primi piatti con pasta fatta in casa, secondi di carne e pesce, e dolci artigianali. Vuoi che ti mostri il menu completo?"
    ]
  },
  {
    name: 'conferma',
    priority: 3,
    patterns: ['si', 'certo', 'ok', 'va bene', 'grazie', 'perfetto', 'procedi', 'mostrami'],
    responses: [
      "Mi dispiace, non sono sicuro di cosa stai confermando. Puoi essere più specifico sulla tua richiesta?",
      "Vorrei aiutarti, ma ho bisogno di sapere cosa confermi esattamente. Puoi specificare meglio?"
    ]
  },
  {
    name: 'attivita_info',
    priority: 2,
    patterns: ['attività', 'fare', 'attivita', 'tour', 'visita', 'escursione', 'svago', 'divertimento'],
    keyPhrases: ['cosa fare', 'cosa possiamo fare', 'attività disponibili', 'cosa c\'è da fare', 'quali attività'],
    responses: [
      "A Villa Petriolo offriamo molte attività. All'interno della struttura puoi partecipare a degustazioni di vini (45€), corsi di cucina toscana (85€) o rilassarti nella nostra spa (30€). All'esterno organizziamo tour in bicicletta (35€), passeggiate a cavallo (60€) e visite al frantoio (15€). Ti interessa qualcosa in particolare?",
      "Le nostre attività includono esperienze all'interno della tenuta come degustazioni e corsi di cucina, e all'esterno con escursioni nelle colline toscane. Posso darti maggiori dettagli su qualche attività specifica?"
    ]
  },
  {
    name: 'default',
    priority: 0,
    patterns: [],
    responses: [
      "Mi dispiace, non ho informazioni specifiche su questo argomento. Posso aiutarti con il menu del ristorante, le attività disponibili o i servizi della struttura. Come posso esserti utile?",
      "Non sono sicuro di aver capito correttamente. Posso fornirti informazioni sul nostro ristorante, le attività disponibili o i servizi generali della villa. Cosa ti interessa sapere?"
    ]
  }
];

// Funzione per identificare l'intento con sistema di punteggio migliorato
const identifyIntent = (message, previousIntent) => {
  const lowerMessage = message.toLowerCase();
  
  // Gestione delle conferme basate sul contesto precedente
  if (previousIntent === 'menu_info' && 
      (lowerMessage.includes('si') || 
       lowerMessage.includes('certo') || 
       lowerMessage.includes('ok') || 
       lowerMessage.includes('va bene') || 
       lowerMessage.includes('grazie') || 
       lowerMessage.includes('mostrami'))) {
    
    const menuCompleto = intents.find(i => i.name === 'menu_completo');
    return { 
      intent: 'menu_completo', 
      response: menuCompleto.response(message)
    };
  }
  
  // Controllo specifico per menu completo
  if (lowerMessage.includes('menu completo') || 
      lowerMessage.includes('tutti i piatti') || 
      lowerMessage.includes('mostrami il menu') ||
      lowerMessage.includes('vedere il menu') ||
      (lowerMessage.includes('menu') && lowerMessage.includes('completo'))) {
    const intent = intents.find(i => i.name === 'menu_completo');
    return { 
      intent: 'menu_completo', 
      response: intent.response(message)
    };
  }
  
  // Controllo specifico per "che si mangia", "cosa si mangia"
  if (lowerMessage.includes('che si mangia') || 
      lowerMessage.includes('cosa si mangia') ||
      lowerMessage.includes('cosa mangiamo') ||
      lowerMessage.includes('che c') && lowerMessage.includes('menu')) {
    const menuIntent = intents.find(i => i.name === 'menu_info');
    return { 
      intent: 'menu_info', 
      response: getRandomResponse(menuIntent.responses)
    };
  }
  
  // Normale valutazione di intenti per altri casi
  const scores = {};
  
  // Assegna punteggi agli intenti
  for (const intent of intents) {
    if (intent.name === 'menu_completo') continue; // Già gestito sopra
    
    scores[intent.name] = 0;
    
    // Controlla pattern singoli
    if (intent.patterns) {
      for (const pattern of intent.patterns) {
        if (lowerMessage.includes(pattern)) {
          scores[intent.name] += 1 * (intent.priority || 1);
        }
      }
    }
    
    // Controlla frasi chiave
    if (intent.keyPhrases) {
      for (const phrase of intent.keyPhrases) {
        if (lowerMessage.includes(phrase)) {
          scores[intent.name] += 3 * (intent.priority || 1);
        }
      }
    }
  }
  
  console.log('Punteggi intenti:', scores);
  
  // Trova l'intento con il punteggio più alto
  let bestIntent = 'default';
  let highestScore = 0;
  
  for (const intent in scores) {
    if (scores[intent] > highestScore) {
      highestScore = scores[intent];
      bestIntent = intent;
    }
  }
  
  // Ottieni l'intento selezionato
  const selectedIntent = intents.find(i => i.name === bestIntent);
  
  // Per intenti con funzioni di risposta personalizzate
  if (typeof selectedIntent.response === 'function') {
    return {
      intent: selectedIntent.name,
      response: selectedIntent.response(message)
    };
  }
  
  // Per intenti con array di risposte
  return { 
    intent: selectedIntent.name, 
    response: getRandomResponse(selectedIntent.responses) 
  };
};

exports.processMessage = async (req, res) => {
  try {
    const { message, roomId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Il messaggio è richiesto' });
    }
    
    const sessionId = roomId || 'guest';
    const previousIntent = sessionContext[sessionId] || null;
    
    console.log(`Ricevuto messaggio da camera ${sessionId}: ${message}`);
    console.log(`Contesto precedente: ${previousIntent}`);
    
    // Gestione contesto per domande di follow-up
    const lowerMessage = message.toLowerCase();
    
    if (previousIntent === 'menu_info' && 
        (lowerMessage.includes('si') || 
         lowerMessage.includes('certo') || 
         lowerMessage.includes('va bene') || 
         lowerMessage === 'ok' ||
         lowerMessage.includes('grazie'))) {
        
      const menuCompleto = intents.find(i => i.name === 'menu_completo');
      if (menuCompleto) {
        sessionContext[sessionId] = 'menu_completo';
        return res.json({ response: menuCompleto.response(message) });
      }
    }
    
    // Gestione standard per altri tipi di domande
    if ((lowerMessage.includes('tutti') && lowerMessage.includes('piatti')) || 
        lowerMessage === 'sono tutti?' || 
        lowerMessage === 'è tutto?' || 
        lowerMessage === 'c\'è altro?') {
        
      const menuCompleto = intents.find(i => i.name === 'menu_completo');
      if (menuCompleto) {
        sessionContext[sessionId] = 'menu_completo';
        return res.json({ response: menuCompleto.response(message) });
      }
    }
    
    // Normale identificazione dell'intento
    const { intent, response } = identifyIntent(message, previousIntent);
    console.log(`Intento identificato: ${intent}`);
    
    // Salva il contesto per la prossima interazione
    sessionContext[sessionId] = intent;
    
    res.json({ response });
  } catch (error) {
    console.error('Errore nell\'elaborazione del messaggio:', error);
    res.status(500).json({ 
      error: 'Si è verificato un errore nell\'elaborazione della richiesta',
      details: error.message 
    });
  }
};