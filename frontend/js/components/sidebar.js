// frontend/js/components/sidebar.js
// Gestione della sidebar laterale

const SidebarComponent = {
  /**
   * Aggiorna la lista delle chat nella sidebar
   * @param {string} currentChatId - ID della chat attualmente attiva
   */
  updateChatList: function(currentChatId) {
    console.log('Updating chat list, current chat ID:', currentChatId);
    
    const sidebarChats = document.getElementById('sidebar-chats');
    if (!sidebarChats) {
      console.error('Sidebar chats container not found');
      return;
    }
    
    const chats = window.StorageManager.getChats();
    const chatIds = Object.keys(chats).sort((a, b) => {
      return new Date(chats[b].timestamp) - new Date(chats[a].timestamp);
    });
    
    // Clear sidebar
    sidebarChats.innerHTML = '';
    
    if (chatIds.length === 0) {
      sidebarChats.innerHTML = '<div class="empty-chats">Nessuna chat disponibile</div>';
      return;
    }
    
    // Add each chat to sidebar
    chatIds.forEach(chatId => {
      const chat = chats[chatId];
      const chatEl = document.createElement('div');
      chatEl.className = `chat-item ${chatId === currentChatId ? 'active' : ''}`;
      
      chatEl.innerHTML = `
        <div class="chat-item-content" data-id="${chatId}">
          <div class="chat-item-title">${chat.title || 'Nuova conversazione'}</div>
          <div class="chat-item-date">${new Date(chat.timestamp).toLocaleDateString()}</div>
        </div>
        <button class="delete-chat-btn" data-id="${chatId}" type="button">
          <i class="fas fa-trash"></i>
        </button>
      `;
      
      sidebarChats.appendChild(chatEl);
    });
    
    // Add click events
    this.setupChatItemListeners();
    this.setupDeleteButtons();
    
    console.log('Chat list updated successfully');
  },
  
  /**
   * Configura i listener per gli elementi della chat
   */
  setupChatItemListeners: function() {
    const chatItemContents = document.querySelectorAll('.chat-item-content');
    chatItemContents.forEach(el => {
      el.addEventListener('click', (e) => {
        const chatId = el.getAttribute('data-id');
        console.log('Chat item clicked, ID:', chatId);
        if (typeof window.ChatCore.loadChat === 'function') {
          window.ChatCore.loadChat(chatId);
          
          // Chiudi la sidebar su mobile
          if (window.innerWidth <= 768) {
            document.body.classList.remove('sidebar-open');
          }
        } else {
          console.error('ChatCore.loadChat function not available');
        }
      });
    });
  },
  
  /**
   * Configura i pulsanti di eliminazione
   */
  setupDeleteButtons: function() {
    const deleteBtns = document.querySelectorAll('.delete-chat-btn');
    
    deleteBtns.forEach(btn => {
      // Usa onclick diretto invece di addEventListener
      btn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const chatId = btn.getAttribute('data-id');
        
        if (confirm('Sei sicuro di voler eliminare questa chat?')) {
          // Esegue direttamente l'operazione invece di usare un callback
          const chats = window.StorageManager.getChats();
          delete chats[chatId];
          window.StorageManager.saveChats(chats);
          
          // Se era la chat corrente, crea una nuova chat
          if (window.ChatCore.state.currentChatId === chatId) {
            window.ChatCore.createNewChat();
          } else {
            // Aggiorna solo la sidebar
            this.updateChatList(window.ChatCore.state.currentChatId);
          }
        }
      };
    });
  },
  
  /**
   * Esegue l'eliminazione della chat
   */
  performDeleteChat: function(chatId) {
    if (typeof window.ChatCore?.deleteChat === 'function') {
      window.ChatCore.deleteChat(chatId);
    } else {
      console.error('ChatCore.deleteChat function not available');
      
      // Implementazione diretta come fallback
      try {
        const chats = window.StorageManager.getChats();
        delete chats[chatId];
        window.StorageManager.saveChats(chats);
        
        // Aggiorna la UI
        this.updateChatList();
        
        // Se necessario, crea una nuova chat
        if (Object.keys(chats).length === 0 && typeof window.ChatCore?.createNewChat === 'function') {
          window.ChatCore.createNewChat();
        }
      } catch (error) {
        console.error('Error in fallback delete chat:', error);
      }
    }
  },
  
  /**
   * Apre la sidebar (per mobile)
   */
  openSidebar: function() {
    if (window.innerWidth <= 768) {
      document.body.classList.add('sidebar-open');
      console.log('Sidebar opened');
    }
  },
  
  /**
   * Chiude la sidebar (per mobile)
   */
  closeSidebar: function() {
    if (window.innerWidth <= 768) {
      document.body.classList.remove('sidebar-open');
      console.log('Sidebar closed');
    }
  },
  
  /**
   * Imposta gli eventi per la UI mobile
   */
  setupMobileUI: function() {
    console.log('Setting up mobile UI');
    
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    // Gestione del pulsante toggle
    if (sidebarToggle) {
      // Rimuovi event listener esistenti
      const newToggle = sidebarToggle.cloneNode(true);
      if (sidebarToggle.parentNode) {
        sidebarToggle.parentNode.replaceChild(newToggle, sidebarToggle);
      }
      
      newToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Sidebar toggle clicked');
        // Toggle della sidebar
        if (document.body.classList.contains('sidebar-open')) {
          this.closeSidebar();
        } else {
          this.openSidebar();
        }
      });
    } else {
      console.error('Sidebar toggle button not found');
    }
    
    // Utilizziamo SOLO l'overlay per la chiusura della sidebar
    if (sidebarOverlay) {
      // Rimuovi event listener esistenti
      const newOverlay = sidebarOverlay.cloneNode(true);
      if (sidebarOverlay.parentNode) {
        sidebarOverlay.parentNode.replaceChild(newOverlay, sidebarOverlay);
      }
      
      newOverlay.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Sidebar overlay clicked');
        this.closeSidebar();
      });
      
      // Assicurati che sia cliccabile
      newOverlay.style.pointerEvents = 'auto';
    } else {
      console.error('Sidebar overlay not found');
    }
    
    console.log('Mobile UI setup completed');
  }
};

// Esporta il modulo
window.SidebarComponent = SidebarComponent;

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', function() {
  // Assicurati che la sidebar mobile sia configurata
  if (typeof window.SidebarComponent.setupMobileUI === 'function') {
    window.SidebarComponent.setupMobileUI();
  }
});

// Reinizializza anche al caricamento completo della pagina
window.addEventListener('load', function() {
  // Assicurati che la sidebar mobile sia configurata
  if (typeof window.SidebarComponent.setupMobileUI === 'function') {
    window.SidebarComponent.setupMobileUI();
  }
});