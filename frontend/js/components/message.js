// frontend/js/components/message.js
// Gestione dei messaggi nella chat

const MessageComponent = {
    /**
     * Mostra un messaggio nella UI
     * @param {string} text - Testo del messaggio
     * @param {string} sender - Mittente ('user' o 'bot')
     */
    displayMessage: function(text, sender) {
      const messagesContainer = document.getElementById('messages-container');
      if (!messagesContainer) return;
      
      const messageRow = document.createElement('div');
      messageRow.className = `message-row ${sender === 'user' ? 'user-row' : 'bot-row'}`;
      
      // Formatta il messaggio solo se è del bot e abbiamo il formattatore
      let formattedText = text;
      if (sender === 'bot' && window.messageFormatter) {
        formattedText = window.messageFormatter.format(text);
      }
      
      messageRow.innerHTML = `
        <div class="message ${sender === 'user' ? 'user-message' : 'bot-message'}">
          <div class="message-avatar">
            <i class="${sender === 'user' ? 'fas fa-user' : 'fas fa-concierge-bell'}"></i>
          </div>
          <div class="message-content">
            ${formattedText}
          </div>
        </div>
      `;
      
      // Aggiunge suggerimenti rapidi solo se è un messaggio del bot
      if (sender === 'bot') {
        // Verifica se il messaggio contiene formattazione speciale
        const hasFormattedContent = messageRow.querySelector('.formatted-section');
        
        // Verifica se il messaggio finisce con una domanda 
        const lastChar = text.trim().slice(-1);
        const endsWithQuestion = lastChar === '?';
        
        // Aggiungi i suggerimenti rapidi se non ha formattazione o se ha formattazione
        // ma contiene anche una conclusione con punto interrogativo
        if (endsWithQuestion || (hasFormattedContent && text.includes('?'))) {
          window.SuggestionsComponent.addQuickSuggestionsToMessage(messageRow, text);
        }
      }
      
      messagesContainer.appendChild(messageRow);
      
      // Imposta la variabile --item-index per ogni elemento della lista per l'animazione
      const listItems = messageRow.querySelectorAll('.list-item');
      listItems.forEach((item, index) => {
        item.style.setProperty('--item-index', index);
      });
      
      // Scorri alla fine del contenitore dei messaggi
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    /**
     * Mostra l'indicatore di digitazione
     */
    showTypingIndicator: function() {
      const messagesContainer = document.getElementById('messages-container');
      if (!messagesContainer) return;
      
      const indicatorRow = document.createElement('div');
      indicatorRow.className = 'message-row bot-row';
      indicatorRow.id = 'typing-indicator-row';
      
      indicatorRow.innerHTML = `
        <div class="message bot-message">
          <div class="message-avatar">
            <i class="fas fa-concierge-bell"></i>
          </div>
          <div class="message-content typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      `;
      
      messagesContainer.appendChild(indicatorRow);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    /**
     * Rimuove l'indicatore di digitazione
     */
    removeTypingIndicator: function() {
      const indicator = document.getElementById('typing-indicator-row');
      if (indicator) indicator.remove();
    }
  };
  
  // Esporta il modulo
  window.MessageComponent = MessageComponent;