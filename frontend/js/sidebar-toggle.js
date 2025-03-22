// frontend/js/ui/sidebar-toggle.js
// Gestione della funzionalità di espansione/riduzione della sidebar

const SidebarToggleManager = {
    /**
     * Inizializza il gestore del toggle della sidebar
     */
    init: function() {
      console.log('Inizializzazione controllo sidebar toggle');
      
      // Trova il pulsante di toggle e il contenitore principale
      this.sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
      this.container = document.querySelector('.chat-container');
      
      // Se il pulsante non esiste, esci
      if (!this.sidebarToggleBtn) {
        console.error('Pulsante di toggle della sidebar non trovato');
        return;
      }
      
      // Aggiungi evento di click al pulsante
      this.setupEventListeners();
      
      // Ripristina lo stato salvato al caricamento della pagina
      this.restoreSidebarState();
    },
    
    /**
     * Verifica se siamo in modalità mobile
     * @returns {boolean} true se siamo in modalità mobile
     */
    isMobileView: function() {
      return window.innerWidth <= 768;
    },
    
    /**
     * Gestisce il toggle della sidebar
     */
    toggleSidebar: function() {
      // Se siamo in modalità mobile, non fare nulla con questo pulsante
      if (this.isMobileView()) return;
      
      // Reset delle animazioni prima di applicare la nuova
      this.sidebarToggleBtn.style.animation = 'none';
      this.sidebarToggleBtn.offsetHeight; // Trigger reflow per far ripartire l'animazione
      this.sidebarToggleBtn.style.animation = '';
      
      // Toggle della classe per nascondere completamente la sidebar
      this.container.classList.toggle('sidebar-hidden');
      
      // Salva lo stato nel localStorage per ricordarlo tra le sessioni
      const isHidden = this.container.classList.contains('sidebar-hidden');
      window.StorageManager.saveSidebarState(isHidden);
      
      console.log('Sidebar toggle stato: ' + (isHidden ? 'nascosta' : 'visibile'));
    },
    
    /**
     * Imposta gli event listener necessari
     */
    setupEventListeners: function() {
      this.sidebarToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Previeni il bubbling
        this.toggleSidebar();
      });
      
      // Gestione del ridimensionamento della finestra
      window.addEventListener('resize', () => {
        // Se torniamo in modalità desktop da mobile
        if (!this.isMobileView()) {
          // Ripristina lo stato salvato
          const isHidden = window.StorageManager.getSidebarState();
          if (isHidden && !this.container.classList.contains('sidebar-hidden')) {
            this.container.classList.add('sidebar-hidden');
            
            // Reset dell'animazione
            this.sidebarToggleBtn.style.animation = 'none';
            setTimeout(() => {
              this.sidebarToggleBtn.style.animation = '';
            }, 10);
          }
        } 
        // Se passiamo a modalità mobile e la sidebar era nascosta
        else if (this.container.classList.contains('sidebar-hidden')) {
          this.container.classList.remove('sidebar-hidden');
        }
      });
    },
    
    /**
     * Ripristina lo stato salvato della sidebar
     */
    restoreSidebarState: function() {
      const isHidden = window.StorageManager.getSidebarState();
      
      // Applica lo stato solo se non siamo in modalità mobile
      if (!this.isMobileView() && isHidden) {
        this.container.classList.add('sidebar-hidden');
        console.log('Ripristinato stato sidebar: nascosta');
        
        // Reset dell'animazione per evitare che si attivi al caricamento
        this.sidebarToggleBtn.style.animation = 'none';
        setTimeout(() => {
          this.sidebarToggleBtn.style.animation = '';
        }, 10);
      } else {
        console.log('Ripristinato stato sidebar: visibile');
      }
    }
  };
  
  // Esporta il modulo
  window.SidebarToggleManager = SidebarToggleManager;
  
  // Inizializza quando il DOM è pronto
  document.addEventListener('DOMContentLoaded', () => {
    window.SidebarToggleManager.init();
  });