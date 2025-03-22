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