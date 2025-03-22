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
    
    // Rimuovi event listener esistenti
    const newChatForm = chatForm.cloneNode(true);
    chatForm.parentNode.replaceChild(newChatForm, chatForm);
    
    newChatForm.addEventListener('submit', (e) => {
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
    
    console.log('Chat form event listener set up');
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
    
    // Aggiungi il nuovo listener direttamente senza onclick nell'HTML
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
    
    // Funzione globale per creare nuove chat (più sicura)
    window.createNewChatAndClose = function() {
      console.log('createNewChatAndClose called');
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
    
    console.log('New chat button event listener set up');
  },
  
  /**
   * Configura il listener per l'evento appReady 
   * (scatenato quando il preloader è completato)
   */
  setupAppReadyListener: function() {
    document.addEventListener('appReady', function() {
      console.log('App ready event received');
      // Inizializza tutti i componenti necessari
      if (typeof window.ChatCore === 'object' && typeof window.ChatCore.initialize === 'function') {
        window.ChatCore.initialize();
      } else {
        console.error('ChatCore not available or initialize method not found');
      }
      
      // Inizializza il gestore dei temi
      if (typeof window.ThemeManager === 'object' && typeof window.ThemeManager.init === 'function') {
        window.ThemeManager.init();
      } else {
        console.error('ThemeManager not available or init method not found');
      }
      
      // Inizializza il gestore responsive
      if (typeof window.ResponsiveManager === 'object' && typeof window.ResponsiveManager.init === 'function') {
        window.ResponsiveManager.init();
      } else {
        console.error('ResponsiveManager not available or init method not found');
      }
      
      // Setup del sidebar toggle
      if (typeof window.SidebarToggleManager === 'object' && typeof window.SidebarToggleManager.init === 'function') {
        window.SidebarToggleManager.init();
      }
      
      // Setup mobile UI
      if (typeof window.SidebarComponent === 'object' && typeof window.SidebarComponent.setupMobileUI === 'function') {
        window.SidebarComponent.setupMobileUI();
      }
      
      // Reinizializza i suggerimenti welcome
      const welcomeMessage = document.querySelector('.welcome-message');
      if (welcomeMessage && window.SuggestionsComponent) {
        window.SuggestionsComponent.setupWelcomeSuggestions(welcomeMessage);
      }
      
      console.log('All components initialized after appReady');
    });
  }
};

// Esporta il modulo
window.EventsManager = EventsManager;

// Inizializzazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded event fired in events.js');
  // Inizializza il gestore degli eventi
  window.EventsManager.init();
});