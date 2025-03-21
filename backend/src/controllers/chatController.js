const axios = require('axios');
const menu = require('../data/menu.json');
const attivita = require('../data/attivita.json');

// Sistema di intenti migliorato
const intents = [
  // Altri intenti...
  {
    name: 'menu_completo',
    priority: 4,
    patterns: ['menu completo', 'tutti i piatti', 'elenco piatti', 'carta completa'],
    response: (message) => {
      let menuCompleto = "Ecco il nostro menu completo:\n\n";
      
      // Antipasti
      menuCompleto += "**ANTIPASTI**\n";
      menu.antipasti.forEach(piatto => {
        menuCompleto += `- ${piatto.nome} (${piatto.prezzo}€): ${piatto.descrizione}\n`;
      });
      
      // Primi
      menuCompleto += "\n**PRIMI PIATTI**\n";
      menu.primi.forEach(piatto => {
        menuCompleto += `- ${piatto.nome} (${piatto.prezzo}€): ${piatto.descrizione}\n`;
      });
      
      // Secondi
      menuCompleto += "\n**SECONDI PIATTI**\n";
      menu.secondi.forEach(piatto => {
        if (piatto.prezzoperetto) {
          menuCompleto += `- ${piatto.nome} (${piatto.prezzo}€ all'etto): ${piatto.descrizione}\n`;
        } else {
          menuCompleto += `- ${piatto.nome} (${piatto.prezzo}€): ${piatto.descrizione}\n`;
        }
      });
      
      // Dolci
      menuCompleto += "\n**DOLCI**\n";
      menu.dolci.forEach(piatto => {
        menuCompleto += `- ${piatto.nome} (${piatto.prezzo}€): ${piatto.descrizione}\n`;
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
  // Altri intenti...
];

// Funzione per identificare l'intento con sistema di punteggio migliorato
const identifyIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
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
  
  // Normale valutazione di intenti per altri casi
  const scores = {};
  
  // Assegna punteggi agli intenti
  for (const intent of intents) {
    if (intent.name === 'menu_completo') continue; // Già gestito sopra
    
    scores[intent.name] = 0;
    
    // Controlla pattern singoli
    for (const pattern of intent.patterns || []) {
      if (lowerMessage.includes(pattern)) {
        scores[intent.name] += 1 * (intent.priority || 1);
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
  const bestIntent = Object.keys(scores).reduce((a, b) => 
    scores[a] > scores[b] ? a : b, Object.keys(scores)[0]
  );
  
  // Se nessun intento ha un punteggio positivo, usa l'intento predefinito
  if (!bestIntent || scores[bestIntent] === 0) {
    const defaultIntent = intents.find(i => i.name === 'default');
    return { 
      intent: 'default', 
      response: getRandomResponse(defaultIntent.responses) 
    };
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
  
  // Per intenti con modificatori
  if (selectedIntent.modifiers) {
    for (const [modifier, response] of Object.entries(selectedIntent.modifiers)) {
      if (lowerMessage.includes(modifier)) {
        return { intent: selectedIntent.name, response };
      }
    }
    return { intent: selectedIntent.name, response: selectedIntent.default_response };
  }
  
  // Per intenti con array di risposte
  return { 
    intent: selectedIntent.name, 
    response: getRandomResponse(selectedIntent.responses) 
  };
};

// Resto del controller...
exports.processMessage = async (req, res) => {
  try {
    const { message, roomId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Il messaggio è richiesto' });
    }
    
    console.log(`Ricevuto messaggio da camera ${roomId || 'sconosciuta'}: ${message}`);
    
    // Gestione contesto
    // Se la domanda è "sono tutti i piatti?" o simile dopo una domanda sul menu
    const lowerMessage = message.toLowerCase();
    if ((lowerMessage.includes('tutti') && lowerMessage.includes('piatti')) || 
        lowerMessage === 'sono tutti?' || 
        lowerMessage === 'è tutto?' || 
        lowerMessage === 'c\'è altro?') {
        
      const menuCompleto = intents.find(i => i.name === 'menu_completo');
      if (menuCompleto) {
        return res.json({ response: menuCompleto.response(message) });
      }
    }
    
    // Normale identificazione dell'intento
    const { intent, response } = identifyIntent(message);
    console.log(`Intento identificato: ${intent}`);
    
    res.json({ response });
  } catch (error) {
    console.error('Errore nell\'elaborazione del messaggio:', error);
    res.status(500).json({ 
      error: 'Si è verificato un errore nell\'elaborazione della richiesta',
      details: error.message 
    });
  }
};