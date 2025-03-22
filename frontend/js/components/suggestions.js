// frontend/js/components/suggestions.js
// Gestione dei suggerimenti rapidi nella chat

const SuggestionsComponent = {
  /**
   * Aggiunge suggerimenti rapidi a un messaggio del bot
   * @param {HTMLElement} messageRow - Elemento DOM del messaggio
   * @param {string} text - Testo del messaggio
   */
  addQuickSuggestionsToMessage: function(messageRow, text) {
    // Non aggiungere suggerimenti se il testo è vuoto
    if (!text || text.trim().length === 0) return;
    
    // Analizza l'argomento del messaggio per contestualizzare i suggerimenti
    let messageContext = 'generale';
    
    if (text.match(/ristorante|menu|piatti|mangiare|cena|pranzo/i)) {
      messageContext = 'ristorante';
    } else if (text.match(/attività|tour|escursion|visita/i)) {
      messageContext = 'attivita';
    } else if (text.match(/eventi|programma|spettacolo/i)) {
      messageContext = 'eventi';
    } else if (text.match(/servizi|camera|reception/i)) {
      messageContext = 'servizi';
    }
    
    // Verifica se il messaggio termina con una domanda
    const lastSentences = text.split(/[.!]/).filter(s => s.trim().length > 0);
    const lastSentence = lastSentences[lastSentences.length - 1].trim();
    const containsQuestionAtEnd = lastSentence.includes('?');
    
    // Definisci suggerimenti in base al contesto
    let suggestions = this.getSuggestionsByContext(messageContext, containsQuestionAtEnd);
    
    // Aggiungi i suggerimenti solo se ne abbiamo
    if (suggestions.length > 0) {
      const suggestionsContainer = document.createElement('div');
      suggestionsContainer.className = 'quick-suggestions';
      
      suggestions.forEach(suggestion => {
        const suggestionBtn = document.createElement('button');
        suggestionBtn.className = 'quick-suggestion';
        suggestionBtn.textContent = suggestion;
        suggestionBtn.addEventListener('click', () => {
          console.log('Suggestion clicked:', suggestion);
          // Inserisci il suggerimento nell'input e invia
          const messageInput = document.getElementById('message-input');
          const chatForm = document.getElementById('chat-form');
          if (messageInput && chatForm) {
            messageInput.value = suggestion;
            // Utilizza Event constructor per compatibilità massima
            const submitEvent = new Event('submit', {
              bubbles: true,
              cancelable: true
            });
            chatForm.dispatchEvent(submitEvent);
          } else {
            console.error('Message input or chat form not found');
          }
        });
        suggestionsContainer.appendChild(suggestionBtn);
      });
      
      // Aggiungi i suggerimenti al messaggio
      const messageContent = messageRow.querySelector('.message-content');
      if (messageContent) {
        messageContent.appendChild(suggestionsContainer);
      } else {
        console.error('Message content element not found');
      }
    }
  },
  
  /**
   * Ottiene i suggerimenti in base al contesto
   * @param {string} context - Contesto del messaggio
   * @param {boolean} isQuestion - Se il messaggio termina con una domanda
   * @returns {string[]} Array di suggerimenti
   */
  getSuggestionsByContext: function(context, isQuestion) {
    if (isQuestion) {
      switch (context) {
        case 'ristorante':
          return [
            'Vorrei prenotare un tavolo',
            'Avete opzioni vegetariane?',
            'Orari di apertura?',
            'Prezzo medio per persona?'
          ];
        case 'attivita':
          return [
            'Quanto dura questa attività?',
            'Quanto costa?',
            'Adatta ai bambini?',
            'Come posso prenotare?'
          ];
        case 'eventi':
          return [
            'A che ora inizia?',
            'Serve prenotare?',
            'Qual è il prezzo?',
            'Altri eventi in programma?'
          ];
        case 'servizi':
          return [
            'Orari del check-in?',
            'È disponibile il WiFi?',
            'C\'è un parcheggio?',
            'Offrite servizio in camera?'
          ];
        default:
          return [
            'Sì, grazie',
            'Ditemi di più',
            'Orari e prezzi?',
            'Come posso prenotare?'
          ];
      }
    } else {
      // Se non è una domanda, offri opzioni generali basate sul contesto
      switch (context) {
        case 'ristorante':
          return [
            'Vorrei prenotare',
            'Menu completo?',
            'Specialità della casa?',
            'Opzioni per allergici?'
          ];
        case 'attivita':
          return [
            'Più informazioni',
            'Altre attività?',
            'Vorrei prenotare',
            'Tour privati?'
          ];
        case 'eventi':
          return [
            'Eventi di domani?',
            'Eventi per bambini?',
            'Concerti?',
            'Eventi gratuiti?'
          ];
        case 'servizi':
          return [
            'Servizi inclusi?',
            'Trasporto?',
            'Servizi extra?',
            'Assistenza 24h?'
          ];
        default:
          return [
            'Menu ristorante',
            'Attività disponibili',
            'Servizi offerti',
            'Eventi in programma'
          ];
      }
    }
  },
  
  /**
   * Imposta i listener per i suggerimenti welcome
   * @param {HTMLElement} welcomeMessage - Elemento DOM del messaggio di benvenuto
   */
  setupWelcomeSuggestions: function(welcomeMessage) {
    if (!welcomeMessage) {
      console.error('Welcome message element not found');
      return;
    }
    
    console.log('Setting up welcome suggestions');
    
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    
    // Seleziona tutti i chip di suggerimento
    const suggestionChips = welcomeMessage.querySelectorAll('.suggestion-chip');
    console.log(`Found ${suggestionChips.length} suggestion chips`);
    
    suggestionChips.forEach(chip => {
      // Rimuovi eventuali listener precedenti clonando l'elemento
      const newChip = chip.cloneNode(true);
      chip.parentNode.replaceChild(newChip, chip);
      
      newChip.addEventListener('click', function() {
        const message = this.getAttribute('data-message');
        console.log('Suggestion chip clicked:', message);
        
        if (messageInput && chatForm) {
          messageInput.value = message;
          // Usa createEvent per massima compatibilità
          const submitEvent = new Event('submit', {
            bubbles: true,
            cancelable: true
          });
          chatForm.dispatchEvent(submitEvent);
        } else {
          console.error('Message input or chat form not found');
        }
      });
    });
    
    console.log('Welcome suggestions setup completed');
  }
};

// Esporta il modulo
window.SuggestionsComponent = SuggestionsComponent;