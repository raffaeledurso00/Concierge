// Modifica al file backend/src/controllers/chatController.js
const axios = require('axios');
const aiService = require('../services/aiService');

// Gestione delle richieste di messaggio
exports.processMessage = async (req, res) => {
  try {
    const { message, roomId = 'default-room' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Il messaggio è richiesto' });
    }

    // Processa il messaggio utilizzando il servizio AI
    try {
      const botResponse = await aiService.processMessage(message, roomId);
      res.json({ response: botResponse, roomId });
    } catch (error) {
      console.error('Errore nel processare il messaggio:', error);
      
      // Se c'è un errore nel servizio AI, prova con la risposta di fallback
      const fallbackResponse = aiService.generateFallbackResponse(roomId);
      res.json({ response: fallbackResponse, roomId });
    }
  } catch (error) {
    console.error('Errore generale:', error);
    const errorResponse = "Mi scuso, ma sto avendo problemi tecnici. Potrebbe riprovare tra poco?";
    res.json({ response: errorResponse, roomId: req.body.roomId || 'default-room' });
  }
};
// Modifica nella funzione generateContextualResponse
function generateContextualResponse(roomId, message) {
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
  }
  
  return null;
}