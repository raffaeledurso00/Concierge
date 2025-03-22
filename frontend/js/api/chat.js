// frontend/js/api/chat.js
// Gestione delle chiamate API per la chat

const ChatAPI = {
    /**
     * Invia un messaggio al backend
     * @param {string} text - Testo del messaggio
     * @param {string} roomId - ID della stanza/chat
     * @param {Object} userContext - Contesto utente (preferenze, etc.)
     * @returns {Promise<string>} - Promessa che si risolve con la risposta
     */
    async sendMessage(text, roomId, userContext = {}) {
      try {
        // Costruisci il payload della richiesta
        const payload = {
          message: text,
          roomId: roomId || 'default_room',
          context: userContext
        };
        
        // Effettua la chiamata API
        const response = await fetch(window.appConfig.BACKEND_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        
        // Verifica la risposta
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        
        // Estrai e restituisci la risposta
        const data = await response.json();
        return data.response;
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Gestione degli errori: risposte di fallback basate sul contesto
        return this.getFallbackResponse(text);
      }
    },
    
    /**
     * Genera una risposta di fallback per casi di errore di rete
     * @param {string} text - Il testo della domanda originale
     * @returns {string} Una risposta di fallback contestualizzata
     */
    getFallbackResponse(text) {
      // Personalizza la risposta in base al contenuto della domanda
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('menu') || lowerText.includes('mangiare') || 
          lowerText.includes('ristorante') || lowerText.includes('cena')) {
        return "Il nostro ristorante è aperto ogni giorno dalle 12:30 alle 14:30 e dalle 19:30 alle 22:00. Offriamo cucina toscana tradizionale con ingredienti freschi e locali. La specialità della casa è la bistecca alla fiorentina. Desidera prenotare un tavolo o conoscere il menu completo?";
      } 
      else if (lowerText.includes('attività') || lowerText.includes('fare') || 
              lowerText.includes('escursion')) {
        return "Villa Petriolo offre diverse attività come degustazioni di vino, corsi di cucina, passeggiate guidate tra gli ulivi, tour in bicicletta e visita alla nostra fattoria biologica. Per domani è previsto anche un tour speciale nei vigneti. Quale di queste attività le interessa di più?";
      } 
      else if (lowerText.includes('altro')) {
        return "Certamente! Abbiamo anche una spa con sauna e bagno turco, una piscina all'aperto con vista panoramica sulle colline toscane, e organizziamo eventi settimanali come degustazioni di olio d'oliva e serate musicali. C'è qualcosa di particolare che le interessa?";
      }
      
      // Risposta generica
      return "Mi scusi, sto riscontrando problemi di connessione. Come posso aiutarla con il suo soggiorno a Villa Petriolo? Posso fornirle informazioni sul ristorante, sulle attività disponibili o sui servizi della struttura.";
    }
  };
  
  // Esporta il modulo
  window.ChatAPI = ChatAPI;