// frontend/js/components/sidebar.js
// Gestione della sidebar laterale

const SidebarComponent = {
    /**
     * Aggiorna la lista delle chat nella sidebar
     * @param {string} currentChatId - ID della chat attualmente attiva
     */
    updateChatList: function(currentChatId) {
      console.log('Updating chat list');
      
      const sidebarChats = document.getElementById('sidebar-chats');
      if (!sidebarChats) return;
      
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
      document.querySelectorAll('.chat-item-content').forEach(el => {
        el.addEventListener('click', () => {
          if (typeof window.ChatCore.loadChat === 'function') {
            window.ChatCore.loadChat(el.dataset.id);
          }
        });
      });
      
      // Add delete events with custom modal
      document.querySelectorAll('.delete-chat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const chatId = btn.dataset.id;
          
          // Usa il modale personalizzato
          window.ModalComponent.showModal('Sei sicuro di voler eliminare questa chat?', () => {
            if (typeof window.ChatCore.deleteChat === 'function') {
              window.ChatCore.deleteChat(chatId);
            }
          });
        });
      });
    },
    
    /**
     * Apre la sidebar (per mobile)
     */
    openSidebar: function() {
      if (window.innerWidth <= 768) {
        document.body.classList.add('sidebar-open');
      }
    },
    
    /**
     * Chiude la sidebar (per mobile)
     */
    closeSidebar: function() {
      if (window.innerWidth <= 768) {
        document.body.classList.remove('sidebar-open');
      }
    },
    
    /**
     * Imposta gli eventi per la UI mobile
     */
    setupMobileUI: function() {
      const sidebarToggle = document.getElementById('sidebar-toggle');
      const sidebarOverlay = document.getElementById('sidebar-overlay');
      const chatSidebar = document.querySelector('.chat-sidebar');
      
      // Gestione del pulsante toggle
      if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          // Toggle della sidebar
          if (document.body.classList.contains('sidebar-open')) {
            this.closeSidebar();
          } else {
            this.openSidebar();
          }
        });
      }
      
      // Utilizziamo SOLO l'overlay per la chiusura della sidebar
      if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
          this.closeSidebar();
        });
      }
      
      // CORREZIONE: Impedisci che i clic sulla sidebar la chiudano
      if (chatSidebar) {
        chatSidebar.addEventListener('click', (e) => {
          e.stopPropagation(); // Ferma la propagazione dell'evento
        });
      }
      
      // Gestisci i ridimensionamenti della finestra
      window.addEventListener('resize', () => {
        // Se la finestra viene ridimensionata oltre 768px mentre il menu è aperto
        if (window.innerWidth > 768 && document.body.classList.contains('sidebar-open')) {
          // Rimuovi la classe sidebar-open
          document.body.classList.remove('sidebar-open');
        }
      });
    }
  };
  
  // Esporta il modulo
  window.SidebarComponent = SidebarComponent;