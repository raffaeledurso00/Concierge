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
      
      // Se il preloader è già completato, inizializza direttamente
      if (!document.getElementById('js-preloader') || 
          document.getElementById('js-preloader').style.display === 'none') {
        console.log('Preloader already completed, initializing app directly');
        
        // Trigger appReady event
        const event = new Event('appReady');
        document.dispatchEvent(event);
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
    
    // Il preloader viene gestito direttamente nel tag <script> in index.html
    // per garantire che venga eseguito prima di qualsiasi altro script
    
    // Tieni traccia dei file caricati
    let loadedCount = 0;
    
    // Carica ciascun file in sequenza
    jsFiles.forEach(function(src) {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;  // Mantieni l'ordine di caricamento
      
      script.onload = function() {
        loadedCount++;
        console.log(`Loaded ${src} (${loadedCount}/${jsFiles.length})`);
        
        // Se tutti i file sono stati caricati, chiama il callback
        if (loadedCount === jsFiles.length) {
          onAllModulesLoaded();
        }
      };
      
      script.onerror = function() {
        console.error(`Failed to load ${src}`);
        loadedCount++;
        
        // Continua comunque anche in caso di errore
        if (loadedCount === jsFiles.length) {
          onAllModulesLoaded();
        }
      };
      
      document.body.appendChild(script);
    });
  });