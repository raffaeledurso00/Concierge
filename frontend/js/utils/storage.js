// frontend/js/utils/storage.js
// Gestione del localStorage per l'applicazione

const StorageManager = {
    /**
     * Ottiene tutte le chat dal localStorage
     * @returns {Object} Oggetto contenente tutte le chat
     */
    getChats: function() {
      try {
        const chats = localStorage.getItem(window.appConfig.STORAGE_KEYS.CHATS);
        return chats ? JSON.parse(chats) : {};
      } catch (error) {
        console.error('Error getting chats:', error);
        return {};
      }
    },
    
    /**
     * Salva tutte le chat nel localStorage
     * @param {Object} chats - Oggetto contenente tutte le chat
     */
    saveChats: function(chats) {
      try {
        localStorage.setItem(window.appConfig.STORAGE_KEYS.CHATS, JSON.stringify(chats));
      } catch (error) {
        console.error('Error saving chats:', error);
      }
    },
    
    /**
     * Salva lo stato della sidebar
     * @param {boolean} isHidden - Indica se la sidebar è nascosta
     */
    saveSidebarState: function(isHidden) {
      localStorage.setItem(window.appConfig.STORAGE_KEYS.SIDEBAR_STATE, isHidden ? 'true' : 'false');
    },
    
    /**
     * Ottiene lo stato della sidebar
     * @returns {boolean} true se la sidebar era nascosta, false altrimenti
     */
    getSidebarState: function() {
      return localStorage.getItem(window.appConfig.STORAGE_KEYS.SIDEBAR_STATE) === 'true';
    },
    
    /**
     * Salva il tema attuale
     * @param {string} theme - Il tema da salvare
     */
    saveTheme: function(theme) {
      localStorage.setItem(window.appConfig.STORAGE_KEYS.THEME, theme);
    },
    
    /**
     * Ottiene il tema salvato
     * @returns {string|null} Il tema salvato o null se non presente
     */
    getTheme: function() {
      return localStorage.getItem(window.appConfig.STORAGE_KEYS.THEME);
    }
  };
  
  // Esporta il modulo
  window.StorageManager = StorageManager;