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
// Fix completamente riscritto per i pulsanti di eliminazione chat
const fixDeleteButtons = function() {
    console.log('Installing robust delete button handler');
    
    // Rimuovi qualsiasi listener esistente
    document.removeEventListener('click', window._deleteButtonHandler);
    
    // Definisci una nuova funzione handler e salvala globalmente per poterla rimuovere dopo
    window._deleteButtonHandler = function(e) {
      // Cerca il pulsante delete o l'icona del cestino
      let target = e.target;
      let foundDeleteElement = false;
      
      // Controlla se l'elemento è un pulsante delete o un'icona del cestino
      if (target.classList && (
          target.classList.contains('delete-chat-btn') || 
          target.classList.contains('fa-trash')
      )) {
        foundDeleteElement = true;
      }
      
      // Se non abbiamo trovato direttamente, cerca nei genitori (per l'icona dentro il bottone)
      if (!foundDeleteElement) {
        // Cerca nei genitori fino a 3 livelli
        for (let i = 0; i < 3 && target; i++) {
          target = target.parentElement;
          if (target && target.classList && (
              target.classList.contains('delete-chat-btn') || 
              target.classList.contains('fa-trash')
          )) {
            foundDeleteElement = true;
            break;
          }
        }
      }
      
      // Se ancora non abbiamo trovato, esci
      if (!foundDeleteElement) return;
      
      // A questo punto, se abbiamo trovato l'icona, dobbiamo assicurarci di avere il pulsante
      if (target.classList.contains('fa-trash')) {
        // Risali fino al pulsante
        while (target && !target.classList.contains('delete-chat-btn')) {
          target = target.parentElement;
        }
        
        // Se non troviamo il pulsante, esci
        if (!target) return;
      }
      
      // Abbiamo trovato il pulsante delete, fermia la propagazione e previeni l'azione di default
      e.stopPropagation();
      e.preventDefault();
      
      // Ottieni l'ID della chat
      let chatId = target.getAttribute('data-id');
      console.log('Delete button clicked for chat ID:', chatId);
      
      // Se non c'è un ID o è vuoto, esci
      if (!chatId) {
        console.error('No chat ID found');
        return;
      }
      
      // Chiedi conferma
      if (!confirm('Sei sicuro di voler eliminare questa chat?')) {
        console.log('Deletion cancelled by user');
        return;
      }
      
      console.log('Deleting chat with ID:', chatId);
      
      try {
        // Implementazione diretta e semplice usando localStorage
        // 1. Ottieni le chat dal localStorage
        const storedChats = localStorage.getItem('villa_petriolo_chats');
        if (!storedChats) {
          console.error('No chats found in localStorage');
          return;
        }
        
        // 2. Converti da JSON a oggetto
        const chats = JSON.parse(storedChats);
        
        // 3. Verifica che la chat esista
        if (!chats[chatId]) {
          console.error('Chat not found in storage:', chatId);
          return;
        }
        
        // 4. Salva l'ID della chat corrente
        const currentChatId = window.ChatCore?.state?.currentChatId;
        console.log('Current chat ID:', currentChatId);
        
        // 5. Elimina la chat
        delete chats[chatId];
        console.log('Chat removed from object');
        
        // 6. Salva l'oggetto aggiornato nel localStorage
        localStorage.setItem('villa_petriolo_chats', JSON.stringify(chats));
        console.log('Updated chats saved to localStorage');
        
        // 7. Gestisci l'UI
        if (chatId === currentChatId) {
          // Era la chat attiva, dobbiamo creare una nuova chat o caricarne un'altra
          const remainingChatIds = Object.keys(chats);
          console.log('Remaining chat IDs:', remainingChatIds);
          
          if (remainingChatIds.length > 0) {
            // Ci sono ancora chat disponibili, carica la prima
            console.log('Loading first available chat');
            if (window.ChatCore?.loadChat) {
              window.ChatCore.loadChat(remainingChatIds[0]);
            } else {
              // Non possiamo caricare, ricarica la pagina
              console.log('ChatCore.loadChat not available, reloading page');
              window.location.reload();
            }
          } else {
            // Non ci sono più chat, crea una nuova chat
            console.log('No chats left, creating new chat');
            if (window.ChatCore?.createNewChat) {
              window.ChatCore.createNewChat();
            } else {
              // Non possiamo creare una nuova chat, ricarica la pagina
              console.log('ChatCore.createNewChat not available, reloading page');
              window.location.reload();
            }
          }
        } else {
          // Non era la chat attiva, aggiorna solo la sidebar
          console.log('Updating sidebar with current chat ID:', currentChatId);
          if (window.SidebarComponent?.updateChatList) {
            window.SidebarComponent.updateChatList(currentChatId);
          } else {
            // Non possiamo aggiornare la sidebar, ricarica la pagina
            console.log('SidebarComponent.updateChatList not available, reloading page');
            window.location.reload();
          }
        }
        
        // Come fallback, forza un aggiornamento della pagina dopo 500ms se sembra che nulla sia cambiato
        setTimeout(() => {
          // Controlla se la chat è ancora presente nella sidebar
          const chatElement = document.querySelector(`.chat-item-content[data-id="${chatId}"]`);
          if (chatElement) {
            console.log('Chat still in sidebar, forcing reload');
            window.location.reload();
          }
        }, 500);
        
        console.log('Deletion process completed successfully');
      } catch (error) {
        console.error('Error during chat deletion:', error);
        alert('Si è verificato un errore durante l\'eliminazione della chat. La pagina verrà ricaricata.');
        window.location.reload();
      }
    };
    
    // Aggiungi il listener
    document.addEventListener('click', window._deleteButtonHandler);
    
    console.log('Robust delete button handler installed successfully');
  };
  
  // Esegui subito e ricorsivamente
  (function ensureDeleteButtonsWork() {
    fixDeleteButtons();
    
    // Ricorsivamente controlla ogni 2 secondi per assicurarsi che i button funzionino
    setTimeout(ensureDeleteButtonsWork, 2000);
  })();
      
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