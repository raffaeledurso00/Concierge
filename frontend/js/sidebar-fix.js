
// Funzione globale per creare una nuova chat senza ricaricamento
window.createNewChatAndClose = function() {
    // Evita di eseguire doppi click
    if (window.isCreatingChat) return;
    window.isCreatingChat = true;
    
    // Trova l'elemento che contiene tutti i messaggi
    const messagesContainer = document.getElementById('messages-container');
    
    // Genera un nuovo ID per la chat
    const chatId = 'chat_' + Date.now();
    
    // Svuota l'area dei messaggi
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }
    
    // Mostra il messaggio di benvenuto
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage && messagesContainer) {
        const welcomeClone = welcomeMessage.cloneNode(true);
        welcomeClone.style.display = 'block';
        messagesContainer.appendChild(welcomeClone);
        
        // Aggiungi event listener ai chip di suggerimento
        const chatForm = document.getElementById('chat-form');
        const messageInput = document.getElementById('message-input');
        
        welcomeClone.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', function() {
                const message = this.dataset.message;
                if (messageInput && chatForm) {
                    messageInput.value = message;
                    chatForm.dispatchEvent(new Event('submit'));
                }
            });
        });
    }
    
    // Salva la nuova chat nel localStorage
    try {
        const chats = JSON.parse(localStorage.getItem('villa_petriolo_chats') || '{}');
        chats[chatId] = {
            messages: [],
            timestamp: new Date().toISOString(),
            title: 'Nuova conversazione'
        };
        localStorage.setItem('villa_petriolo_chats', JSON.stringify(chats));
        
        // Aggiorna la lista delle chat nella sidebar
        const sidebarChats = document.getElementById('sidebar-chats');
        if (sidebarChats) {
            const chatIds = Object.keys(chats).sort((a, b) => {
                return new Date(chats[b].timestamp) - new Date(chats[a].timestamp);
            });
            
            // Pulisci sidebar
            sidebarChats.innerHTML = '';
            
            if (chatIds.length === 0) {
                sidebarChats.innerHTML = '<div class="empty-chats">Nessuna chat disponibile</div>';
            } else {
                // Aggiungi ogni chat alla sidebar
                chatIds.forEach(id => {
                    const chat = chats[id];
                    const chatEl = document.createElement('div');
                    chatEl.className = `chat-item ${id === chatId ? 'active' : ''}`;
                    
                    chatEl.innerHTML = `
                        <div class="chat-item-content" data-id="${id}">
                            <div class="chat-item-title">${chat.title || 'Nuova conversazione'}</div>
                            <div class="chat-item-date">${new Date(chat.timestamp).toLocaleDateString()}</div>
                        </div>
                        <button class="delete-chat-btn" data-id="${id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    
                    sidebarChats.appendChild(chatEl);
                });
            }
        }
    } catch (error) {
        console.error('Error saving new chat:', error);
    }
    
    // Chiudi la sidebar su mobile
    if (window.innerWidth <= 768) {
        document.body.classList.remove('sidebar-open');
    }
    
    // Reset del flag
    setTimeout(function() {
        window.isCreatingChat = false;
    }, 500);
};
