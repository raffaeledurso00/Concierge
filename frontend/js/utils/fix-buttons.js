// frontend/js/utils/fix-buttons.js
/**
 * Script di emergenza per correggere problemi con i pulsanti
 * Viene eseguito dopo il caricamento completo della pagina
 */

(function() {
    console.log('Running emergency button fix script');
    
    /**
     * Corregge tutti i pulsanti nella pagina
     */
    function fixAllButtons() {
      fixNewChatButton();
      fixSidebarToggleButton();
      fixMobileSidebarToggle();
      fixWelcomeSuggestions();
      fixQuickSuggestions();
      fixDeleteChatButtons();
    }
    
    /**
     * Corregge il pulsante "Nuova chat"
     */
    function fixNewChatButton() {
      const newChatBtn = document.getElementById('new-chat-btn');
      if (!newChatBtn) {
        console.error('New chat button not found');
        return;
      }
      
      console.log('Fixing new chat button');
      
      // Rimuovi eventuali listener e attributi onclick
      newChatBtn.removeAttribute('onclick');
      const newBtn = newChatBtn.cloneNode(true);
      if (newChatBtn.parentNode) {
        newChatBtn.parentNode.replaceChild(newBtn, newChatBtn);
      }
      
      // Aggiungi un handler diretto
      newBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('New chat button clicked via emergency fix');
        
        // Ottieni tutti i chat disponibili
        try {
          // Crea una nuova chat (versione base che non dovrebbe fallire)
          const chatId = 'chat_' + Date.now();
          const messagesContainer = document.getElementById('messages-container');
          
          if (messagesContainer) {
            // Pulisci i messaggi
            messagesContainer.innerHTML = '';
            
            // Crea il messaggio di benvenuto
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.innerHTML = `
              <h2>Benvenuto al Concierge Digitale di Villa Petriolo</h2>
              <p>Sono qui per aiutarti con:</p>
              <div class="suggestion-chips">
                <button class="suggestion-chip" data-message="Quali sono gli orari del ristorante?">
                  <i class="fas fa-utensils"></i> Ristorante
                </button>
                <button class="suggestion-chip" data-message="Che attività posso fare oggi?">
                  <i class="fas fa-hiking"></i> Attività
                </button>
                <button class="suggestion-chip" data-message="Quali eventi sono in programma?">
                  <i class="fas fa-calendar-alt"></i> Eventi
                </button>
                <button class="suggestion-chip" data-message="Come posso prenotare un servizio?">
                  <i class="fas fa-concierge-bell"></i> Servizi
                </button>
              </div>
            `;
            
            messagesContainer.appendChild(welcomeDiv);
            
            // Aggiungi listener ai suggerimenti
            setTimeout(fixWelcomeSuggestions, 100);
          }
          
          // Chiamata normale a ChatCore se disponibile
          if (window.ChatCore && typeof window.ChatCore.createNewChat === 'function') {
            window.ChatCore.createNewChat();
          }
        } catch (error) {
          console.error('Error in emergency new chat handler:', error);
        }
      };
      
      // Assicurati che sia cliccabile
      newBtn.style.pointerEvents = 'auto';
      newBtn.style.cursor = 'pointer';
    }
    
    /**
     * Corregge il pulsante toggle della sidebar
     */
    function fixSidebarToggleButton() {
      const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
      if (!sidebarToggleBtn) {
        console.error('Sidebar toggle button not found');
        return;
      }
      
      console.log('Fixing sidebar toggle button');
      
      // Rimuovi eventuali listener precedenti
      sidebarToggleBtn.removeAttribute('onclick');
      const newToggleBtn = sidebarToggleBtn.cloneNode(true);
      if (sidebarToggleBtn.parentNode) {
        sidebarToggleBtn.parentNode.replaceChild(newToggleBtn, sidebarToggleBtn);
      }
      
      // Aggiungi un handler diretto
      newToggleBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Sidebar toggle button clicked via emergency fix');
        
        // Implementazione diretta del toggle
        document.body.classList.toggle('sidebar-hidden');
      };
      
      // Assicurati che sia cliccabile
      newToggleBtn.style.pointerEvents = 'auto';
      newToggleBtn.style.cursor = 'pointer';
    }
    
    /**
     * Corregge il pulsante toggle mobile della sidebar
     */
    function fixMobileSidebarToggle() {
      const mobileSidebarToggle = document.getElementById('sidebar-toggle');
      if (!mobileSidebarToggle) {
        console.error('Mobile sidebar toggle button not found');
        return;
      }
      
      console.log('Fixing mobile sidebar toggle button');
      
      // Rimuovi eventuali listener precedenti
      mobileSidebarToggle.removeAttribute('onclick');
      const newMobileToggle = mobileSidebarToggle.cloneNode(true);
      if (mobileSidebarToggle.parentNode) {
        mobileSidebarToggle.parentNode.replaceChild(newMobileToggle, mobileSidebarToggle);
      }
      
      // Aggiungi un handler diretto
      newMobileToggle.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Mobile sidebar toggle clicked via emergency fix');
        
        // Implementazione diretta del toggle mobile
        document.body.classList.toggle('sidebar-open');
        
        // Assicurati che l'overlay funzioni anche per la chiusura
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        if (sidebarOverlay) {
          sidebarOverlay.onclick = function() {
            document.body.classList.remove('sidebar-open');
          };
        }
      };
      
      // Assicurati che sia cliccabile
      newMobileToggle.style.pointerEvents = 'auto';
      newMobileToggle.style.cursor = 'pointer';
    }
    
    /**
     * Corregge i pulsanti di eliminazione delle chat
     */
    function fixDeleteChatButtons() {
      const deleteButtons = document.querySelectorAll('.delete-chat-btn');
      if (deleteButtons.length === 0) {
        console.log('No delete chat buttons found to fix');
        return;
      }
      
      console.log(`Fixing ${deleteButtons.length} delete chat buttons`);
      
      deleteButtons.forEach(button => {
        // Rimuovi eventuali listener precedenti
        button.removeAttribute('onclick');
        const newButton = button.cloneNode(true);
        if (button.parentNode) {
          button.parentNode.replaceChild(newButton, button);
        }
        
        // Aggiungi un handler diretto
        newButton.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const chatId = this.getAttribute('data-id');
          console.log('Delete chat button clicked via emergency fix for chat ID:', chatId);
          
          // Chiedi conferma direttamente
          if (confirm('Sei sicuro di voler eliminare questa chat?')) {
            // Implementazione diretta dell'eliminazione
            try {
              if (window.ChatCore && typeof window.ChatCore.deleteChat === 'function') {
                window.ChatCore.deleteChat(chatId);
              } else {
                // Fallback manuale per eliminare la chat
                deleteChat(chatId);
              }
            } catch (error) {
              console.error('Error deleting chat:', error);
            }
          }
        };
        
        // Assicurati che sia cliccabile
        newButton.style.pointerEvents = 'auto';
        newButton.style.cursor = 'pointer';
      });
    }
    
    /**
     * Implementazione di fallback per eliminare una chat
     */
    function deleteChat(chatId) {
      // Recupera tutte le chat dal localStorage
      try {
        const storageKey = window.appConfig?.STORAGE_KEYS?.CHATS || 'villa_petriolo_chats';
        const chatsJson = localStorage.getItem(storageKey);
        if (chatsJson) {
          const chats = JSON.parse(chatsJson);
          
          // Elimina la chat specificata
          if (chats[chatId]) {
            delete chats[chatId];
            
            // Salva le chat aggiornate
            localStorage.setItem(storageKey, JSON.stringify(chats));
            
            // Aggiorna la UI
            if (window.SidebarComponent && typeof window.SidebarComponent.updateChatList === 'function') {
              window.SidebarComponent.updateChatList();
            }
            
            // Se necessario, crea una nuova chat
            if (Object.keys(chats).length === 0 && window.ChatCore && typeof window.ChatCore.createNewChat === 'function') {
              window.ChatCore.createNewChat();
            }
            
            // Alternativa: ricarica la pagina
            if (Object.keys(chats).length === 0) {
              window.location.reload();
            }
          }
        }
      } catch (error) {
        console.error('Error in manual chat deletion:', error);
      }
    }
    
    /**
     * Corregge i suggerimenti nel messaggio di benvenuto
     */
    function fixWelcomeSuggestions() {
      const welcomeMessage = document.querySelector('.welcome-message');
      if (!welcomeMessage) {
        console.log('Welcome message not found for emergency fix');
        return;
      }
      
      console.log('Fixing welcome suggestions');
      
      // Seleziona tutti i chip di suggerimento
      const suggestionChips = welcomeMessage.querySelectorAll('.suggestion-chip');
      console.log(`Found ${suggestionChips.length} suggestion chips to fix`);
      
      suggestionChips.forEach(chip => {
        // Rimuovi eventuali listener precedenti
        chip.removeAttribute('onclick');
        const newChip = chip.cloneNode(true);
        chip.parentNode.replaceChild(newChip, chip);
        
        // Aggiungi un handler diretto
        newChip.onclick = function() {
          const message = this.getAttribute('data-message');
          console.log('Welcome suggestion clicked via emergency fix:', message);
          
          const messageInput = document.getElementById('message-input');
          if (messageInput) {
            messageInput.value = message;
            
            // Invia tramite ChatCore o implementa un fallback
            if (window.ChatCore && typeof window.ChatCore.handleMessageSubmit === 'function') {
              window.ChatCore.handleMessageSubmit(message);
            } else {
              // Fallback: simula invio manualmente
              const chatForm = document.getElementById('chat-form');
              if (chatForm) {
                const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                chatForm.dispatchEvent(submitEvent);
              }
            }
          }
        };
        
        // Assicurati che sia cliccabile
        newChip.style.pointerEvents = 'auto';
        newChip.style.cursor = 'pointer';
      });
    }
    
    /**
     * Corregge i suggerimenti rapidi nei messaggi
     */
    function fixQuickSuggestions() {
      const quickSuggestions = document.querySelectorAll('.quick-suggestion');
      if (quickSuggestions.length === 0) {
        console.log('No quick suggestions found for emergency fix');
        return;
      }
      
      console.log(`Fixing ${quickSuggestions.length} quick suggestions`);
      
      quickSuggestions.forEach(suggestion => {
        // Rimuovi eventuali listener precedenti
        suggestion.removeAttribute('onclick');
        const newSuggestion = suggestion.cloneNode(true);
        suggestion.parentNode.replaceChild(newSuggestion, suggestion);
        
        // Aggiungi un handler diretto
        newSuggestion.onclick = function() {
          const message = this.textContent;
          console.log('Quick suggestion clicked via emergency fix:', message);
          
          if (window.ChatCore && typeof window.ChatCore.handleMessageSubmit === 'function') {
            window.ChatCore.handleMessageSubmit(message);
          }
        };
        
        // Assicurati che sia cliccabile
        newSuggestion.style.pointerEvents = 'auto';
        newSuggestion.style.cursor = 'pointer';
      });
    }
    
    // Esegui fix al caricamento
    function runFixes() {
      console.log('Running emergency fixes for all buttons');
      fixAllButtons();
      
      // Schedula nuovi fix ogni secondo per i prossimi 10 secondi
      let count = 0;
      const interval = setInterval(function() {
        count++;
        console.log(`Running scheduled fix #${count}`);
        fixAllButtons();
        
        if (count >= 10) {
          clearInterval(interval);
          console.log('Completed scheduled fixes');
        }
      }, 1000);
    }
    
    // Correggi l'overlay della sidebar mobile
    function fixSidebarOverlay() {
      const sidebarOverlay = document.getElementById('sidebar-overlay');
      if (!sidebarOverlay) {
        console.error('Sidebar overlay not found');
        return;
      }
      
      console.log('Fixing sidebar overlay');
      
      // Assicurati che l'overlay sia cliccabile
      sidebarOverlay.style.pointerEvents = 'auto';
      
      // Aggiungi un handler diretto
      sidebarOverlay.onclick = function() {
        console.log('Sidebar overlay clicked via emergency fix');
        document.body.classList.remove('sidebar-open');
      };
    }
    
    // Aggiungi listener per il caricamento della pagina
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      console.log('Document already ready, running emergency fixes immediately');
      setTimeout(function() {
        runFixes();
        fixSidebarOverlay();
      }, 500);
    } else {
      window.addEventListener('load', function() {
        console.log('Window loaded, running emergency fixes');
        setTimeout(function() {
          runFixes();
          fixSidebarOverlay();
        }, 500);
      });
    }
    
    // Aggiungi anche un osservatore per rilevare nuovi pulsanti di eliminazione chat
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeType === 1 && (node.classList.contains('delete-chat-btn') || node.querySelector('.delete-chat-btn'))) {
              console.log('New delete button detected, fixing...');
              fixDeleteChatButtons();
            }
            
            // Controlla anche per nuovi suggerimenti
            if (node.nodeType === 1 && (node.classList.contains('quick-suggestion') || node.querySelector('.quick-suggestion'))) {
              console.log('New quick suggestion detected, fixing...');
              fixQuickSuggestions();
            }
          }
        }
      });
    });
    
    // Avvia l'osservatore per monitorare le modifiche alla sidebar
    const sidebarChats = document.getElementById('sidebar-chats');
    if (sidebarChats) {
      observer.observe(sidebarChats, { childList: true, subtree: true });
    }
  })();