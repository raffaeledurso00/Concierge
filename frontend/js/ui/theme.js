// frontend/js/ui/theme.js
// Gestione dei temi dell'interfaccia utente

const ThemeManager = {
    /**
     * Inizializza il gestore dei temi
     */
    init: function() {
      // Carica tema salvato
      this.loadSavedTheme();
      
      // Crea selettore di temi se non esiste già
      this.createThemeSelector();
      
      // Aggiungi event listeners
      this.setupEventListeners();
    },
    
    /**
     * Crea il selettore di temi nell'interfaccia
     */
    createThemeSelector: function() {
      // Cerca container per il selettore
      let container = document.querySelector('.sidebar-footer');
      
      // Se non esiste, esci
      if (!container) {
        console.error('Container per il selettore di temi non trovato');
        return;
      }
      
      // Crea il contenitore per il selettore
      const selectorContainer = document.createElement('div');
      selectorContainer.className = 'theme-selector';
      
      // Aggiungi label
      const label = document.createElement('div');
      label.className = 'theme-selector-label';
      label.textContent = 'Tema';
      selectorContainer.appendChild(label);
      
      // Crea un pulsante per ciascun tema
      window.appConfig.THEMES.forEach(theme => {
        const themeBtn = document.createElement('button');
        const currentTheme = this.getCurrentTheme();
        themeBtn.className = `theme-option${theme === currentTheme ? ' active' : ''}`;
        themeBtn.setAttribute('data-theme', theme);
        themeBtn.setAttribute('title', this.getThemeName(theme));
        themeBtn.setAttribute('aria-label', `Tema ${this.getThemeName(theme)}`);
        
        selectorContainer.appendChild(themeBtn);
      });
      
      // Aggiungi il selettore al container
      container.appendChild(selectorContainer);
    },
    
    /**
     * Imposta gli event listeners 
     */
    setupEventListeners: function() {
      // Aggiungi listener ai pulsanti dei temi
      document.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', e => {
          const theme = e.currentTarget.getAttribute('data-theme');
          this.setTheme(theme);
        });
      });
    },
    
    /**
     * Imposta il tema specificato
     * @param {string} theme - Il tema da applicare
     */
    setTheme: function(theme) {
      const currentTheme = this.getCurrentTheme();
      
      // Ignora se è già il tema corrente
      if (theme === currentTheme) return;
      
      // Imposta il tema sul body
      document.body.setAttribute('data-theme', theme);
      
      // Aggiorna meta theme-color per mobile
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        // Imposta il colore in base al tema
        metaThemeColor.setAttribute('content', window.appConfig.THEME_COLORS[theme] || '#9f887c');
      }
      
      // Aggiorna il pulsante attivo
      document.querySelectorAll('.theme-option').forEach(btn => {
        if (btn.getAttribute('data-theme') === theme) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      // Salva il tema selezionato
      window.StorageManager.saveTheme(theme);
      
      console.log('Tema cambiato a:', this.getThemeName(theme));
    },
    
    /**
     * Carica il tema salvato
     */
    loadSavedTheme: function() {
      const savedTheme = window.StorageManager.getTheme();
      
      if (savedTheme && window.appConfig.THEMES.includes(savedTheme)) {
        document.body.setAttribute('data-theme', savedTheme);
        console.log('Tema caricato da localStorage:', this.getThemeName(savedTheme));
      }
    },
    
    /**
     * Ottiene il tema corrente
     * @returns {string} Il tema corrente
     */
    getCurrentTheme: function() {
      const savedTheme = window.StorageManager.getTheme();
      if (savedTheme && window.appConfig.THEMES.includes(savedTheme)) {
        return savedTheme;
      }
      return 'default'; // tema predefinito
    },
    
    /**
     * Ottieni il nome leggibile del tema
     * @param {string} theme - Codice del tema
     * @returns {string} Nome leggibile del tema
     */
    getThemeName: function(theme) {
      return window.appConfig.THEME_NAMES[theme] || 'Sconosciuto';
    }
  };
  
  // Esporta il modulo
  window.ThemeManager = ThemeManager;