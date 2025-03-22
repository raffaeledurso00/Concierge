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
    this.setupSidebarToggle();
    this.setupAppReadyListener();
    
    // Forzare l'esecuzione anche se già caricato
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      console.log('Document already ready, forcing setup');
      this.setupAllEventListeners();
    }
  },
  
  /**
   * Configura tutti gli event listeners dopo il caricamento completo
   */
  setupAllEventListeners: function() {
    // Esegui tutte le configurazioni di eventi critici
    this.setupChatForm();
    this.setupNewChatButton();
    this.setupSidebarToggle();
    this.setupWelcomeSuggestions();
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
    
    console.log('Setting up chat form');
    
    // Rimuovi tutti gli event listener esistenti
    const oldChatForm = chatForm;
    const newChatForm = oldChatForm.cloneNode(true);
    oldChatForm.parentNode.replaceChild(newChatForm, oldChatForm);
    
    // Gestisce direttamente il submit tramite listener DOM
    newChatForm.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const messageInput = document.getElementById('message-input');
      if (!messageInput) return false;
      
      const userMessage = messageInput.value.trim();
      if (userMessage === '') return false;
      
      console.log('Form submit captured, processing message:', userMessage);
      
      if (window.ChatCore && typeof window.ChatCore.handleMessageSubmit === 'function') {
        window.ChatCore.handleMessageSubmit(userMessage);
      } else {
        console.error('ChatCore not available or handleMessageSubmit method not found');
      }
      
      return false;
    }, true);
    
    console.log('Chat form event listener set up with capturing');
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
    
    console.log('Setting up new chat button with direct DOM event');
    
    // Rimuovi eventuali listener precedenti clonando l'elemento
    const newChatBtnClone = newChatBtn.cloneNode(true);
    newChatBtn.parentNode.replaceChild(newChatBtnClone, newChatBtn);
    
    // Aggiungi il nuovo listener con un handler inline
    newChatBtnClone.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('New chat button clicked with direct DOM event');
      
      if (window.ChatCore && typeof window.ChatCore.createNewChat === 'function') {
        window.ChatCore.createNewChat();
      } else {
        console.error('ChatCore not available or createNewChat method not found');
      }
    });
    
    // Assicurati che il pulsante sia visibile e cliccabile
    newChatBtnClone.style.pointerEvents = 'auto';
    newChatBtnClone.style.cursor = 'pointer';
    
    console.log('New chat button setup completed');
  },
  
  /**
   * Configura il pulsante toggle della sidebar
   */
  setupSidebarToggle: function() {
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    if (!sidebarToggleBtn) {
      console.error('Sidebar toggle button not found');
      return;
    }
    
    console.log('Setting up sidebar toggle button with direct DOM event');
    
    // Rimuovi eventuali listener precedenti
    const newToggleBtn = sidebarToggleBtn.cloneNode(true);
    sidebarToggleBtn.parentNode.replaceChild(newToggleBtn, sidebarToggleBtn);
    
    // Aggiungi il listener con handler inline diretto
    newToggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Sidebar toggle button clicked with direct DOM event');
      
      // Implementazione diretta del toggle
      const isHidden = document.body.classList.toggle('sidebar-hidden');
      
      // Salva lo stato
      if (window.StorageManager && typeof window.StorageManager.saveSidebarState === 'function') {
        window.StorageManager.saveSidebarState(isHidden);
      }
    });
    
    // Assicurati che il pulsante sia visibile e cliccabile
    newToggleBtn.style.pointerEvents = 'auto';
    newToggleBtn.style.cursor = 'pointer';
    
    console.log('Sidebar toggle button setup completed');
  },
  
  /**
   * Configura i suggerimenti nel messaggio di benvenuto
   */
  setupWelcomeSuggestions: function() {
    const welcomeMessage = document.querySelector('.welcome-message');
    if (!welcomeMessage) {
      console.log('Welcome message not found, will try again later');
      return;
    }
    
    console.log('Setting up welcome suggestions with direct DOM events');
    
    // Seleziona tutti i chip di suggerimento
    const suggestionChips = welcomeMessage.querySelectorAll('.suggestion-chip');
    console.log(`Found ${suggestionChips.length} suggestion chips`);
    
    suggestionChips.forEach(chip => {
      // Rimuovi eventuali listener precedenti
      const newChip = chip.cloneNode(true);
      chip.parentNode.replaceChild(newChip, chip);
      
      // Aggiungi un listener diretto
      newChip.addEventListener('click', function() {
        const message = this.getAttribute('data-message');
        console.log('Welcome suggestion clicked:', message);
        
        if (message && window.ChatCore) {
          window.ChatCore.handleMessageSubmit(message);
        }
      });
      
      // Assicurati che sia cliccabile
      newChip.style.pointerEvents = 'auto';
      newChip.style.cursor = 'pointer';
    });
    
    console.log('Welcome suggestions setup completed');
  },
  
  /**
   * Configura il listener per l'evento appReady 
   */
  setupAppReadyListener: function() {
    document.addEventListener('appReady', () => {
      console.log('App ready event received');
      
      // Delay per assicurarsi che il DOM sia completamente caricato
      setTimeout(() => {
        this.setupAllEventListeners();
      }, 500);
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

// Aggiungi anche un listener per il caricamento completo della pagina
window.addEventListener('load', function() {
  console.log('Window load event fired in events.js');
  // Inizializza nuovamente per sicurezza
  if (window.EventsManager) {
    window.EventsManager.setupAllEventListeners();
  }
});