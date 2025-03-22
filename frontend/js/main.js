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