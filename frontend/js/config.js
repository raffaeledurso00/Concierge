// frontend/js/config.js
// Configurazione globale dell'applicazione
const config = {
    // URL del backend
    BACKEND_URL: 'http://localhost:3001/api/chat',
    
    // Chiavi per il localStorage
    STORAGE_KEYS: {
      CHATS: 'villa_petriolo_chats',
      SIDEBAR_STATE: 'sidebar_hidden',
      THEME: 'villa_petriolo_theme'
    },
    
    // Temi disponibili
    THEMES: ['default', 'green', 'blue', 'purple', 'dark', 'light'],
    
    // Colori per ciascun tema (per meta theme-color)
    THEME_COLORS: {
      'default': '#9f887c',
      'green': '#4caf50',
      'blue': '#2196f3',
      'purple': '#9c27b0',
      'dark': '#212121',
      'light': '#f0f0f0'
    },
    
    // Nomi leggibili dei temi
    THEME_NAMES: {
      'default': 'Classico',
      'green': 'Verde',
      'blue': 'Blu',
      'purple': 'Viola',
      'dark': 'Scuro',
      'light': 'Chiaro'
    }
  };
  
  // Esporta la configurazione
  window.appConfig = config;