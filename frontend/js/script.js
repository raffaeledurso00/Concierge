document.addEventListener('DOMContentLoaded', function() {
    // Elementi DOM
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const messagesContainer = document.getElementById('messages-container');
    const sendButton = document.getElementById('send-button');
    const newChatButton = document.getElementById('new-chat-btn');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    // Stato del sistema
    let chatHistory = [];
    let isWaitingForResponse = false;
    
    // Backend URL
    const BACKEND_URL = 'http://localhost:3001/api/chat';
    
    // Genera un ID casuale per la camera (simulando una stanza d'hotel)
    const generateRoomId = () => {
        if (!localStorage.getItem('roomId')) {
            localStorage.setItem('roomId', `room_${Math.floor(Math.random() * 100) + 1}`);
        }
        return localStorage.getItem('roomId');
    };
    
    // Inizializza la chat
    const initChat = () => {
        chatHistory = [];
        messagesContainer.innerHTML = `
            <div class="message-row bot-row">
                <div class="message bot-message">
                    <div class="message-avatar">
                        <i class="fas fa-concierge-bell"></i>
                    </div>
                    <div class="message-content">
                        <p>Benvenuto a Villa Petriolo! Sono il tuo concierge digitale. Posso aiutarti con informazioni sul nostro ristorante, attività disponibili o servizi della struttura. Come posso esserti utile oggi?</p>
                    </div>
                </div>
            </div>
        `;
        messageInput.focus();
    };
    
    // Aggiungi un messaggio alla chat
    const addMessage = (text, sender) => {
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
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Aggiungi alla storia
        chatHistory.push({ sender, text });
    };
    
    // Mostra indicatore di "sta scrivendo"
    const showTypingIndicator = () => {
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
    };
    
    // Rimuovi indicatore di "sta scrivendo"
    const removeTypingIndicator = () => {
        const indicatorRow = document.getElementById('typing-indicator-row');
        if (indicatorRow) {
            indicatorRow.remove();
        }
    };
    
    // Invia un messaggio al backend
    const sendMessageToBackend = async (text) => {
        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    roomId: localStorage.getItem('roomId')
                }),
            });
            
            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Errore nell\'invio del messaggio:', error);
            return "Mi dispiace, sto avendo problemi di connessione. Potresti riprovare tra poco?";
        }
    };
    
    // Gestisci l'invio del messaggio
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        const userMessage = messageInput.value.trim();
        if (userMessage === '' || isWaitingForResponse) return;
        
        // Aggiungi il messaggio dell'utente
        addMessage(userMessage, 'user');
        
        // Pulisci l'input
        messageInput.value = '';
        
        // Mostra indicatore di "sta scrivendo"
        isWaitingForResponse = true;
        showTypingIndicator();
        
        // Simula un piccolo ritardo prima della risposta (per effetto realistico)
        setTimeout(async () => {
            // Ottieni la risposta dal backend
            const botResponse = await sendMessageToBackend(userMessage);
            
            // Rimuovi indicatore e aggiungi la risposta
            removeTypingIndicator();
            addMessage(botResponse, 'bot');
            
            isWaitingForResponse = false;
        }, 1000 + Math.random() * 1000); // Ritardo casuale tra 1-2 secondi
    };
    
    // Event Listeners
    chatForm.addEventListener('submit', handleSendMessage);
    
    newChatButton.addEventListener('click', () => {
        if (confirm('Vuoi iniziare una nuova chat? La conversazione corrente verrà persa.')) {
            initChat();
        }
    });
    
    sidebarToggle.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-open');
    });
    
    // Inizializza
    generateRoomId();
    initChat();
});
