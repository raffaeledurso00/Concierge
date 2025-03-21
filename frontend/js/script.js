document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded');

    // DOM Elements
    const messagesContainer = document.getElementById('messages-container');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const newChatBtn = document.getElementById('new-chat-btn');
    const sidebarChats = document.getElementById('sidebar-chats');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    // State
    let currentChatId = null;
    let isWaitingForResponse = false;
    
    // Backend URL
    const BACKEND_URL = 'http://localhost:3001/api/chat';
    
    console.log('DOM Elements found:', {
        messagesContainer: !!messagesContainer,
        chatForm: !!chatForm,
        messageInput: !!messageInput,
        newChatBtn: !!newChatBtn,
        sidebarChats: !!sidebarChats
    });

    // ===== CORE FUNCTIONS =====
    
    // Get all chats
    function getChats() {
        try {
            const chats = localStorage.getItem('villa_petriolo_chats');
            return chats ? JSON.parse(chats) : {};
        } catch (error) {
            console.error('Error loading chats:', error);
            return {};
        }
    }
    
    // Save all chats
    function saveChats(chats) {
        try {
            localStorage.setItem('villa_petriolo_chats', JSON.stringify(chats));
        } catch (error) {
            console.error('Error saving chats:', error);
        }
    }
    
    // Create a new chat
    function createNewChat() {
        console.log('Creating new chat');
        
        // Generate ID
        currentChatId = 'chat_' + Date.now();
        
        // Clear messages area
        messagesContainer.innerHTML = '';
        
        // Add welcome message
        const welcomeMessage = "Benvenuto a Villa Petriolo! Sono il tuo concierge digitale. Posso aiutarti con informazioni sul nostro ristorante, attività disponibili o servizi della struttura. Come posso esserti utile oggi?";
        addMessage(welcomeMessage, 'bot');
        
        // Update UI
        updateChatList();
    }
    
    // Load a chat
    function loadChat(chatId) {
        console.log('Loading chat:', chatId);
        
        const chats = getChats();
        const chat = chats[chatId];
        
        if (!chat) {
            console.error('Chat not found:', chatId);
            return;
        }
        
        // Set current chat
        currentChatId = chatId;
        
        // Clear and populate messages
        messagesContainer.innerHTML = '';
        chat.messages.forEach(msg => {
            displayMessage(msg.text, msg.sender);
        });
        
        // Update UI
        updateChatList();
    }
    
    // Delete a chat
    function deleteChat(chatId) {
        console.log('Deleting chat:', chatId);
        
        const chats = getChats();
        delete chats[chatId];
        saveChats(chats);
        
        // If current chat is deleted, create a new one
        if (chatId === currentChatId) {
            createNewChat();
        }
        
        updateChatList();
    }
    
    // Update chat list in sidebar
    function updateChatList() {
        console.log('Updating chat list');
        
        const chats = getChats();
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
                loadChat(el.dataset.id);
            });
        });
        
// Funzioni per il modale personalizzato
function showModal(message, confirmCallback) {
    const modal = document.getElementById('custom-modal');
    const modalMessage = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    
    // Imposta il messaggio
    modalMessage.textContent = message;
    
    // Mostra il modale
    modal.classList.add('show');
    
    // Gestisci i pulsanti
    const handleConfirm = () => {
        modal.classList.remove('show');
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        confirmCallback();
    };
    
    const handleCancel = () => {
        modal.classList.remove('show');
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
}

    // Quando aggiungi i bottoni di eliminazione:
    document.querySelectorAll('.delete-chat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const chatId = btn.dataset.id;
            
            // Usa il modale personalizzato invece di confirm()
            showModal('Sei sicuro di voler eliminare questa chat?', () => {
                deleteChat(chatId);
                if (chatId === currentChatId) {
                    createNewChat();
                }
            });
        });
    });
    }
    
    // Add message to current chat
    function addMessage(text, sender) {
        console.log('Adding message:', { sender, text: text.substring(0, 30) + '...' });
        
        // Display message
        displayMessage(text, sender);
        
        // Save message
        const chats = getChats();
        
        if (!currentChatId) {
            currentChatId = 'chat_' + Date.now();
        }
        
        // Get or create chat
        const chat = chats[currentChatId] || {
            messages: [],
            timestamp: new Date().toISOString(),
            title: 'Nuova conversazione'
        };
        
        // Add message
        chat.messages.push({ sender, text });
        
        // Update chat info
        chat.timestamp = new Date().toISOString();
        
        // Set title from first user message
        if (sender === 'user' && chat.messages.filter(m => m.sender === 'user').length === 1) {
            chat.title = text.length > 20 ? text.substring(0, 17) + '...' : text;
        }
        
        // Save
        chats[currentChatId] = chat;
        saveChats(chats);
        
        // Update UI
        updateChatList();
    }
    
    // Display message in UI
    function displayMessage(text, sender) {
        const messageRow = document.createElement('div');
        messageRow.className = `message-row ${sender === 'user' ? 'user-row' : 'bot-row'}`;
        
        messageRow.innerHTML = `
            <div class="message ${sender === 'user' ? 'user-message' : 'bot-message'}">
                <div class="message-avatar">
                    <i class="${sender === 'user' ? 'fas fa-user' : 'fas fa-concierge-bell'}"></i>
                </div>
                <div class="message-content">
                    <p>${text}</p>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(messageRow);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const indicatorRow = document.createElement('div');
        indicatorRow.className = 'message-row bot-row';
        indicatorRow.id = 'typing-indicator-row';
        
        indicatorRow.innerHTML = `
            <div class="message bot-message">
                <div class="message-avatar">
                    <i class="fas fa-concierge-bell"></i>
                </div>
                <div class="message-content typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(indicatorRow);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator-row');
        if (indicator) indicator.remove();
    }
    
    // Send message to backend
    async function sendMessageToBackend(text) {
        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    roomId: 'default_room'
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error sending message:', error);
            return "Mi dispiace, sto avendo problemi di connessione. Potresti riprovare tra poco?";
        }
    }
    
    // ===== EVENT LISTENERS =====
    
    // Form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userMessage = messageInput.value.trim();
        if (userMessage === '' || isWaitingForResponse) return;
        
        // Add user message
        addMessage(userMessage, 'user');
        
        // Clear input
        messageInput.value = '';
        
        // Show typing indicator
        isWaitingForResponse = true;
        showTypingIndicator();
        
        // Send to backend with delay
        setTimeout(async () => {
            const botResponse = await sendMessageToBackend(userMessage);
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Add bot response
            addMessage(botResponse, 'bot');
            
            isWaitingForResponse = false;
        }, 1000 + Math.random() * 1000);
    });
    
    // New chat button
    newChatBtn.addEventListener('click', () => {
        console.log('New chat button clicked');
        createNewChat();
    });
    
    // Sidebar toggle (mobile)
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.body.classList.toggle('sidebar-open');
        });
    }
    
    // ===== INITIALIZATION =====
    
    // Initialize app
    function init() {
        console.log('Initializing app');
        
        const chats = getChats();
        const chatIds = Object.keys(chats).sort((a, b) => {
            return new Date(chats[b].timestamp) - new Date(chats[a].timestamp);
        });
        
        if (chatIds.length > 0) {
            loadChat(chatIds[0]);
        } else {
            createNewChat();
        }
    }
    
    // Start the app
    init();
});