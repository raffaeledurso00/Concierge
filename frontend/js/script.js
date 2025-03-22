document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded');

    // DOM Elements
    const messagesContainer = document.getElementById('messages-container');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const newChatBtn = document.getElementById('new-chat-btn');
    const sidebarChats = document.getElementById('sidebar-chats');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const welcomeMessage = document.getElementById('welcome-message');
    const currentTopicIndicator = document.getElementById('current-topic');
    
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
        
        // Mostra il messaggio di benvenuto
        if (welcomeMessage) {
            // Clona il messaggio di benvenuto per inserirlo nel container
            const welcomeClone = welcomeMessage.cloneNode(true);
            welcomeClone.style.display = 'block';
            messagesContainer.appendChild(welcomeClone);
            
            // Aggiungi event listener ai chip di suggerimento
            welcomeClone.querySelectorAll('.suggestion-chip').forEach(chip => {
                chip.addEventListener('click', function() {
                    const message = this.dataset.message;
                    messageInput.value = message;
                    chatForm.dispatchEvent(new Event('submit'));
                });
            });
        } else {
            // Add welcome message
            const welcomeMessage = "Benvenuto a Villa Petriolo! Sono il tuo concierge digitale. Posso aiutarti con informazioni sul nostro ristorante, attività disponibili o servizi della struttura. Come posso esserti utile oggi?";
            addMessage(welcomeMessage, 'bot');
        }
        
        // Reset context
        if (window.conversationContext) {
            window.conversationContext.reset();
        }
        
        // Update UI
        updateChatList();
        updateTopicIndicator(null);
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
        
        // Reset context
        if (window.conversationContext) {
            window.conversationContext.reset();
            
            // Reconstruct context from chat history
            const userMessages = chat.messages.filter(msg => msg.sender === 'user').map(msg => msg.text);
            userMessages.forEach(msg => {
                window.conversationContext.analyzeMessage(msg, chat.messages);
            });
            
            // Update topic indicator
            updateTopicIndicator(window.conversationContext.currentTopic);
        }
        
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
    
    // Funzione per aggiornare l'indicatore di argomento
    function updateTopicIndicator(topic) {
        if (!currentTopicIndicator) return;
        
        // Rimuovi tutte le classi precedenti
        currentTopicIndicator.className = '';
        
        if (!topic) {
            currentTopicIndicator.textContent = '';
            return;
        }
        
        // Aggiungi la classe appropriata e il testo
        currentTopicIndicator.classList.add(topic);
        
        // Imposta il testo in base all'argomento
        switch (topic) {
            case 'menu':
                currentTopicIndicator.textContent = 'Ristorante';
                break;
            case 'attivita':
                currentTopicIndicator.textContent = 'Attività';
                break;
            case 'servizi':
                currentTopicIndicator.textContent = 'Servizi';
                break;
            case 'eventi':
                currentTopicIndicator.textContent = 'Eventi';
                break;
            default:
                currentTopicIndicator.textContent = '';
        }
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
        
        // Aggiorna il context se è un messaggio dell'utente
        if (sender === 'user' && window.conversationContext) {
            const context = window.conversationContext.analyzeMessage(text, chat.messages);
            updateTopicIndicator(context.topic);
        }
    }
    
    // Display message in UI
// Versione aggiornata della funzione displayMessage da sostituire in script.js

// Display message in UI with formatted lists
function displayMessage(text, sender) {
    const messageRow = document.createElement('div');
    messageRow.className = `message-row ${sender === 'user' ? 'user-row' : 'bot-row'}`;
    
    // Formatta il messaggio solo se è del bot e abbiamo il formattatore
    let formattedText = text;
    if (sender === 'bot' && window.messageFormatter) {
        formattedText = window.messageFormatter.format(text);
    }
    
    messageRow.innerHTML = `
        <div class="message ${sender === 'user' ? 'user-message' : 'bot-message'}">
            <div class="message-avatar">
                <i class="${sender === 'user' ? 'fas fa-user' : 'fas fa-concierge-bell'}"></i>
            </div>
            <div class="message-content">
                ${formattedText}
            </div>
        </div>
    `;
    
    // Aggiunge suggerimenti rapidi se è un messaggio del bot che finisce con una domanda
    if (sender === 'bot' && text.trim().endsWith('?')) {
        addQuickSuggestionsToMessage(messageRow, text);
    }
    
    messagesContainer.appendChild(messageRow);
    
    // Imposta la variabile --item-index per ogni elemento della lista per l'animazione
    const listItems = messageRow.querySelectorAll('.list-item');
    listItems.forEach((item, index) => {
        item.style.setProperty('--item-index', index);
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Funzione per aggiungere suggerimenti rapidi a un messaggio del bot
function addQuickSuggestionsToMessage(messageRow, text) {
    // Estrai potenziali suggerimenti dal testo della domanda
    let suggestions = [];
    
    // Se la domanda contiene "quale" o "preferisce", cerca opzioni nel testo
    if (text.match(/quale|preferisce|interessa|desidera/i)) {
        // Cerca parole chiave con la prima lettera maiuscola (potrebbero essere opzioni)
        const options = text.match(/([A-Z][a-z]+(?:\s+[a-z]+){0,3})/g);
        
        if (options && options.length > 0) {
            // Filtra opzioni che sembrano essere nomi di piatti o attività
            suggestions = [...new Set(options)].filter(option => 
                option.length > 3 && 
                !['Villa', 'Petriolo', 'ANTIPASTI', 'PRIMI', 'SECONDI', 'DOLCI', 'INTERNE', 'ESTERNE', 'ESCURSIONI'].includes(option)
            );
        }
    }
    
    // Se non abbiamo suggerimenti dal testo, usa alcuni predefiniti basati sul contesto
    if (suggestions.length === 0) {
        // Determina il contesto in base alle parole chiave nel testo
        if (text.match(/menu|ristorante|pranzo|cena|piatti|mangiare/i)) {
            suggestions = ['Sì, grazie', 'Quali sono i piatti tipici?', 'Orari di apertura?', 'Posso prenotare?'];
        } else if (text.match(/attività|escursion|tour|visita|passeggiata/i)) {
            suggestions = ['Mi interessa', 'Costi?', 'Durata?', 'Altre opzioni?'];
        } else if (text.match(/evento|spettacolo|concerto|degustazione/i)) {
            suggestions = ['Voglio partecipare', 'Quando?', 'Prezzo?', 'È necessario prenotare?'];
        } else {
            suggestions = ['Sì', 'No', 'Più informazioni', 'Altro?'];
        }
    }
    
    // Limita a 4 suggerimenti
    suggestions = suggestions.slice(0, 4);
    
    // Aggiungi i suggerimenti solo se ne abbiamo
    if (suggestions.length > 0) {
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'quick-suggestions';
        
        suggestions.forEach(suggestion => {
            const suggestionBtn = document.createElement('button');
            suggestionBtn.className = 'quick-suggestion';
            suggestionBtn.textContent = suggestion;
            suggestionBtn.addEventListener('click', () => {
                // Inserisci il suggerimento nell'input e invia
                document.getElementById('message-input').value = suggestion;
                document.getElementById('chat-form').dispatchEvent(new Event('submit'));
            });
            suggestionsContainer.appendChild(suggestionBtn);
        });
        
        // Aggiungi i suggerimenti al messaggio
        messageRow.querySelector('.message-content').appendChild(suggestionsContainer);
    }
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
            // Migliora il messaggio con il contesto se necessario
            let enhancedMessage = text;
            if (window.conversationContext) {
                const chats = getChats();
                const conversation = chats[currentChatId]?.messages || [];
                enhancedMessage = window.conversationContext.enhanceMessage(text, conversation);
            }
            
            // Aggiungi la stanza alla richiesta
            const roomId = currentChatId || 'default_room';
            
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: enhancedMessage,
                    roomId: roomId
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Risposte personalizzate in base al testo della domanda per un'esperienza più fluida anche offline
            if (text.toLowerCase().includes('menu') || text.toLowerCase().includes('mangiare') || 
                text.toLowerCase().includes('ristorante') || text.toLowerCase().includes('cena')) {
                return "Il nostro ristorante è aperto ogni giorno dalle 12:30 alle 14:30 e dalle 19:30 alle 22:00. Offriamo cucina toscana tradizionale con ingredienti freschi e locali. La specialità della casa è la bistecca alla fiorentina. Desidera prenotare un tavolo o conoscere il menu completo?";
            } else if (text.toLowerCase().includes('attività') || text.toLowerCase().includes('fare') || 
                      text.toLowerCase().includes('escursion')) {
                return "Villa Petriolo offre diverse attività come degustazioni di vino, corsi di cucina, passeggiate guidate tra gli ulivi, tour in bicicletta e visita alla nostra fattoria biologica. Per domani è previsto anche un tour speciale nei vigneti. Quale di queste attività le interessa di più?";
            } else if (text.toLowerCase().includes('altro')) {
                return "Certamente! Abbiamo anche una spa con sauna e bagno turco, una piscina all'aperto con vista panoramica sulle colline toscane, e organizziamo eventi settimanali come degustazioni di olio d'oliva e serate musicali. C'è qualcosa di particolare che le interessa?";
            }
            
            return "Mi scusi, sto riscontrando problemi di connessione. Come posso aiutarla con il suo soggiorno a Villa Petriolo? Posso fornirle informazioni sul ristorante, sulle attività disponibili o sui servizi della struttura.";
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
        
        // Disabilita l'input mentre il bot risponde
        messageInput.setAttribute('disabled', 'true');
        messageInput.setAttribute('placeholder', 'Il concierge sta rispondendo...');
        
        // Show typing indicator
        isWaitingForResponse = true;
        showTypingIndicator();
        
        // Aggiungiamo un ritardo variabile e realistico in base alla lunghezza del messaggio
        const baseDelay = 1000; // Ritardo base di 1 secondo
        const charDelay = 15; // 15ms per carattere aggiuntivo
        const randomFactor = Math.random() * 500; // Fattore casuale fino a 0,5 secondi
        
        // Calcola il ritardo totale
        const typingDelay = baseDelay + (userMessage.length * charDelay) + randomFactor;
        
        setTimeout(async () => {
            // Mostra il "typing" per un tempo proporzionale alla complessità della domanda
            const botResponse = await sendMessageToBackend(userMessage);
            
            // Rimuovi l'indicatore di digitazione
            removeTypingIndicator();
            
            // Aggiungi la risposta del bot
            addMessage(botResponse, 'bot');
            
            // Riattiva l'input
            messageInput.removeAttribute('disabled');
            messageInput.setAttribute('placeholder', 'Scrivi un messaggio...');
            messageInput.focus();
            
            isWaitingForResponse = false;
        }, typingDelay);
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