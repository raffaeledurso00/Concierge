// frontend/js/core/events.js
// Gestione eventi principali dell'applicazione

const EventsManager = {
    /**
     * Inizializza tutti gli event listeners dell'applicazione
     */
    init: function() {
      console.log('Initializing events manager');
      
      this.setupChatForm();
      this.setupNewChatButton();
      this.setupAppReadyListener();
    },
    
    /**
     * Configura il form di chat per l'invio dei messaggi
     */
    setupChatForm: function() {
      const chatForm = document.getElementById('chat-form');
      if (!chatForm) {
        console.error('Chat form not found');
        return;
      }
      
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;
        
        const userMessage = messageInput.value.trim();
        if (userMessage !== '') {
          // Invia il messaggio attraverso il ChatCore
          if (typeof window.ChatCore.handleMessageSubmit === 'function') {
            window.ChatCore.handleMessageSubmit(userMessage);
          }
        }
      });
    },
    
    /**
     * Configura il pulsante "Nuova chat"
     */
    setupNewChatButton: function() {
      const newChatBtn = document.getElementById('new-chat-btn');
      if (!newChatBtn) {
        console.error('New chat button not found');
        return;
      }
      
      // Rimuovi eventuali listener precedenti clonando l'elemento
      const newChatBtnClone = newChatBtn.cloneNode(true);
      if (newChatBtn.parentNode) {
        newChatBtn.parentNode.replaceChild(newChatBtnClone, newChatBtn);
      }
      
      // Aggiungi il nuovo listener con gestione corretta degli eventi
      newChatBtnClone.addEventListener('click', function(e) {
        // Ferma la propagazione dell'evento per evitare che raggiunga l'overlay
        e.stopPropagation();
        
        console.log('New chat button clicked with fixed handler');
        
        // Crea una nuova chat tramite ChatCore
        if (typeof window.ChatCore.createNewChat === 'function') {
          window.ChatCore.createNewChat();
        }
        
        // Chiudi la sidebar dopo aver creato la chat (solo su mobile)
        if (window.innerWidth <= 768) {
          window.SidebarComponent.closeSidebar();
        }
      });
      
      // Espone una funzione globale per creare nuove chat
      window.createNewChatAndClose = function() {
        // Evita di eseguire doppi click
        if (window.isCreatingChat) return;
        window.isCreatingChat = true;
        
        // Crea una nuova chat tramite ChatCore
        if (typeof window.ChatCore.createNewChat === 'function') {
          window.ChatCore.createNewChat();
        }
        
        // Reset del flag
        setTimeout(function() {
          window.isCreatingChat = false;
        }, 500);
      };
    },
    
    /**
     * Configura il listener per l'evento appReady 
     * (scatenato quando il preloader è completato)
     */
    setupAppReadyListener: function() {
      document.addEventListener('appReady', function() {
        console.log('App ready event received');
        // Inizializza tutti i componenti necessari
        if (typeof window.ChatCore.initialize === 'function') {
          window.ChatCore.initialize();
        }
        
        // Inizializza il gestore dei temi
        if (typeof window.ThemeManager.init === 'function') {
          window.ThemeManager.init();
        }
        
        // Inizializza il gestore responsive
        if (typeof window.ResponsiveManager.init === 'function') {
          window.ResponsiveManager.init();
        }
      });
    }
  };
  
  // Esporta il modulo
  window.EventsManager = EventsManager;
  
  // Inizializzazione quando il DOM è pronto
  document.addEventListener('DOMContentLoaded', function() {
    // Inizializza il gestore degli eventi
    window.EventsManager.init();
  });