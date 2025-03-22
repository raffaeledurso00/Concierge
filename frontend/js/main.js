// frontend/js/main.js
// Punto di ingresso principale per l'applicazione

/**
 * Villa Petriolo Concierge Digitale
 * 
 * Questo file è il punto di ingresso principale dell'applicazione.
 * Si occupa di importare tutti i moduli necessari e avviare l'inizializzazione.
 * 
 * La sequenza di caricamento è:
 * 1. Configurazione
 * 2. Utilities
 * 3. API
 * 4. Componenti
 * 5. UI
 * 6. Core
 * 7. Inizializzazione
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Villa Petriolo Concierge Digitale - Loading application');
  
  // Funzione di callback quando tutti i moduli sono stati caricati
  const onAllModulesLoaded = function() {
      console.log('All modules loaded successfully');
      
      // Verifica se il preloader esiste ancora
      const preloader = document.getElementById('js-preloader');
      
      // Se il preloader non esiste o è già stato nascosto, inizializza direttamente
      if (!preloader || preloader.style.display === 'none') {
          console.log('Preloader already completed, initializing app directly');
          
          setTimeout(() => {
              // Trigger appReady event
              const event = new Event('appReady');
              document.dispatchEvent(event);
              
              // Carica il fix per i pulsanti
              loadScript('js/utils/fix-buttons.js');
          }, 500); // Aumentato il ritardo per garantire che tutti i moduli siano pronti
      } else {
          console.log('Waiting for preloader completion');
      }
  };
  
  // Lista dei file JavaScript da caricare in ordine
  const jsFiles = [
      // Configurazione
      'js/config.js',
      
      // Utilities
      'js/utils/storage.js',
      'js/utils/formatter.js',
      'js/utils/context.js',
      
      // API
      'js/api/chat.js',
      
      // Componenti
      'js/components/message.js',
      'js/components/suggestions.js',
      'js/components/modal.js',
      'js/components/sidebar.js',
      
      // UI
      'js/ui/theme.js',
      'js/ui/responsive.js',
      'js/ui/sidebar-toggle.js',
      
      // Core
      'js/core/chat.js',
      'js/core/events.js',
      'js/core/init.js'
  ];
  
  // Funzione per caricare un singolo script e attendere il suo caricamento
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false; // Mantieni l'ordine di caricamento
      
      script.onload = () => {
        console.log(`Loaded ${src}`);
        resolve();
      };
      
      script.onerror = () => {
        console.error(`Failed to load ${src}`);
        reject(new Error(`Failed to load ${src}`));
      };
      
      document.body.appendChild(script);
    });
  };
  
  // Carica i file in sequenza per garantire l'ordine corretto
  const loadScriptsSequentially = async () => {
    try {
      for (const file of jsFiles) {
        await loadScript(file);
      }
      onAllModulesLoaded();
    } catch (error) {
      console.error('Error loading scripts:', error);
      // Prova comunque a inizializzare l'app
      onAllModulesLoaded();
    }
  };
  
  // Avvia il caricamento sequenziale
  loadScriptsSequentially();
});

// Aggiungi questo alla fine del file frontend/js/main.js

// Fix semplice per evitare i crash della UI
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
      // Attendi che la pagina sia caricata completamente
      console.log('Applicando fix semplice per prevenire crash');
      
      // Fix per i pulsanti di eliminazione chat
      const fixDeleteButtons = function() {
          const deleteButtons = document.querySelectorAll('.delete-chat-btn');
          deleteButtons.forEach(btn => {
              // Rimuovi eventuali handler esistenti
              const newBtn = btn.cloneNode(true);
              if (btn.parentNode) {
                  btn.parentNode.replaceChild(newBtn, btn);
              }
              
              // Aggiungi un handler semplice e diretto
              newBtn.onclick = function(e) {
                  e.stopPropagation();
                  e.preventDefault();
                  
                  const chatId = this.getAttribute('data-id');
                  if (!chatId) return;
                  
                  if (confirm('Sei sicuro di voler eliminare questa chat?')) {
                      try {
                          // Prova ad usare ChatCore
                          if (window.ChatCore && window.ChatCore.deleteChat) {
                              window.ChatCore.deleteChat(chatId);
                          } else {
                              // Fallback diretto
                              const chats = JSON.parse(localStorage.getItem('villa_petriolo_chats') || '{}');
                              delete chats[chatId];
                              localStorage.setItem('villa_petriolo_chats', JSON.stringify(chats));
                              window.location.reload();
                          }
                      } catch (err) {
                          console.error(err);
                          alert('Errore durante l\'eliminazione. Ricarica la pagina e riprova.');
                      }
                  }
              };
          });
      };
      
      // Fix per il form di chat
      const chatForm = document.getElementById('chat-form');
      if (chatForm) {
          // Rimuovi tutti gli event listener
          const newForm = chatForm.cloneNode(true);
          chatForm.parentNode.replaceChild(newForm, chatForm);
          
          // Aggiungi un solo handler semplice
          newForm.onsubmit = function(e) {
              e.preventDefault();
              e.stopPropagation();
              
              const input = document.getElementById('message-input');
              if (!input || !input.value.trim()) return false;
              
              const message = input.value.trim();
              
              if (window.ChatCore && window.ChatCore.handleMessageSubmit) {
                  window.ChatCore.handleMessageSubmit(message);
              }
              
              return false;
          };
      }
      
      // Fix per il pulsante "Nuova chat"
      const newChatBtn = document.getElementById('new-chat-btn');
      if (newChatBtn) {
          const newBtn = newChatBtn.cloneNode(true);
          newChatBtn.parentNode.replaceChild(newBtn, newChatBtn);
          
          newBtn.onclick = function(e) {
              e.preventDefault();
              e.stopPropagation();
              
              if (window.ChatCore && window.ChatCore.createNewChat) {
                  window.ChatCore.createNewChat();
              }
          };
      }
      
      // Esegui subito una volta
      fixDeleteButtons();
      
      // Monitora l'aggiunta di nuovi pulsanti delete
      const observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
              if (mutation.addedNodes && mutation.addedNodes.length) {
                  for (let i = 0; i < mutation.addedNodes.length; i++) {
                      const node = mutation.addedNodes[i];
                      if (node.classList && node.classList.contains('delete-chat-btn') || 
                          (node.nodeType === 1 && node.querySelector('.delete-chat-btn'))) {
                          setTimeout(fixDeleteButtons, 10);
                          break;
                      }
                  }
              }
          });
      });
      
      // Osserva il contenitore delle chat
      const sidebarChats = document.getElementById('sidebar-chats');
      if (sidebarChats) {
          observer.observe(sidebarChats, { childList: true, subtree: true });
      }
      
  }, 500);
});