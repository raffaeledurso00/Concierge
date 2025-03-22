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
        <button class="delete-chat-btn" data-id="${chatId}">
          <i class="fas fa-trash"></i>
        </button>
      `;
      
      sidebarChats.appendChild(chatEl);
    });
    
    // Add click events
    const chatItemContents = document.querySelectorAll('.chat-item-content');
    chatItemContents.forEach(el => {
      el.addEventListener('click', (e) => {
        const chatId = el.getAttribute('data-id');
        console.log('Chat item clicked, ID:', chatId);
        if (typeof window.ChatCore.loadChat === 'function') {
          window.ChatCore.loadChat(chatId);
        } else {
          console.error('ChatCore.loadChat function not available');
        }
      });
    });
    
    // Add delete events with custom modal
    const deleteBtns = document.querySelectorAll('.delete-chat-btn');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chatId = btn.getAttribute('data-id');
        console.log('Delete button clicked for chat ID:', chatId);
        
        // Usa il modale personalizzato
        if (typeof window.ModalComponent.showModal === 'function') {
          window.ModalComponent.showModal('Sei sicuro di voler eliminare questa chat?', () => {
            if (typeof window.ChatCore.deleteChat === 'function') {
              window.ChatCore.deleteChat(chatId);
            } else {
              console.error('ChatCore.deleteChat function not available');
            }
          });
        } else {
          console.error('ModalComponent.showModal function not available');
          // Fallback: esegui comunque l'eliminazione
          if (typeof window.ChatCore.deleteChat === 'function') {
            if (confirm('Sei sicuro di voler eliminare questa chat?')) {
              window.ChatCore.deleteChat(chatId);
            }
          }
        }
      });
    });
    
    console.log('Chat list updated successfully');
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
    const chatSidebar = document.querySelector('.chat-sidebar');
    
    // Gestione del pulsante toggle
    if (sidebarToggle) {
      // Rimuovi event listener esistenti
      const newToggle = sidebarToggle.cloneNode(true);
      if (sidebarToggle.parentNode) {
        sidebarToggle.parentNode.replaceChild(newToggle, sidebarToggle);
      }
      
      newToggle.addEventListener('click', (e) => {
        e.stopPropagation();
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
      sidebarOverlay.addEventListener('click', () => {
        console.log('Sidebar overlay clicked');
        this.closeSidebar();
      });
    } else {
      console.error('Sidebar overlay not found');
    }
    
    // CORREZIONE: Impedisci che i clic sulla sidebar la chiudano
    if (chatSidebar) {
      chatSidebar.addEventListener('click', (e) => {
        e.stopPropagation(); // Ferma la propagazione dell'evento
      });
    } else {
      console.error('Chat sidebar not found');
    }
    
    // Gestisci i ridimensionamenti della finestra
    window.addEventListener('resize', () => {
      // Se la finestra viene ridimensionata oltre 768px mentre il menu è aperto
      if (window.innerWidth > 768 && document.body.classList.contains('sidebar-open')) {
        // Rimuovi la classe sidebar-open
        document.body.classList.remove('sidebar-open');
        console.log('Sidebar closed on resize');
      }
    });
    
    console.log('Mobile UI setup completed');
  }
};

// Esporta il modulo
window.SidebarComponent = SidebarComponent;