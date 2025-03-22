// Versione minimalista di fix-buttons.js
// Sostituisci completamente il contenuto del file con questo codice

// Funzione auto-invocante per evitare conflitti con lo scope globale
(function() {
    console.log('Applicando fix minimalista');
    
    // Variabile per evitare esecuzioni multiple
    let fixApplied = false;
    
    // Applica tutti i fix una sola volta
    function applyAllFixes() {
        if (fixApplied) return;
        fixApplied = true;
        
        console.log('Applicando i fix ai pulsanti');
        
        // 1. Fix per i pulsanti di eliminazione chat
        fixDeleteButtons();
        
        // 2. Fix per il form di chat
        fixChatForm();
        
        // 3. Fix per il pulsante nuova chat
        fixNewChatButton();
        
        // 4. Fix per suggerimenti welcome
        setTimeout(fixWelcomeSuggestions, 1000);
    }
    
    // Fix per i pulsanti di eliminazione
    function fixDeleteButtons() {
        const deleteButtons = document.querySelectorAll('.delete-chat-btn');
        console.log(`Sistemando ${deleteButtons.length} pulsanti di eliminazione`);
        
        deleteButtons.forEach(btn => {
            // Non usare cloneNode, potrebbe causare problemi
            // Rimuovi solo handler precedenti
            btn.onclick = null;
            
            // Aggiungi un handler diretto e semplice
            btn.onclick = function(e) {
                e.stopPropagation();
                e.preventDefault();
                
                const chatId = this.getAttribute('data-id');
                if (!chatId) return;
                
                console.log('Eliminazione chat richiesta:', chatId);
                
                if (confirm('Sei sicuro di voler eliminare questa chat?')) {
                    try {
                        // Elimina direttamente dal localStorage per maggiore affidabilità
                        const storageKey = 'villa_petriolo_chats';
                        const chatsJson = localStorage.getItem(storageKey);
                        if (chatsJson) {
                            const chats = JSON.parse(chatsJson);
                            
                            // Verifica se la chat esiste
                            if (chats[chatId]) {
                                // Salva l'ID della chat corrente
                                const currentChatId = window.ChatCore?.state?.currentChatId;
                                
                                // Elimina la chat
                                delete chats[chatId];
                                
                                // Salva le modifiche
                                localStorage.setItem(storageKey, JSON.stringify(chats));
                                
                                console.log('Chat eliminata con successo, aggiornamento UI');
                                
                                // Se era la chat corrente, crea una nuova
                                if (currentChatId === chatId) {
                                    if (window.ChatCore?.createNewChat) {
                                        window.ChatCore.createNewChat();
                                    } else {
                                        // Ricarica la pagina come ultima risorsa
                                        window.location.reload();
                                    }
                                } else {
                                    // Altrimenti aggiorna solo la sidebar
                                    if (window.SidebarComponent?.updateChatList) {
                                        window.SidebarComponent.updateChatList(currentChatId);
                                    } else {
                                        window.location.reload();
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        console.error('Errore durante l\'eliminazione:', err);
                        alert('Si è verificato un errore. Ricarica la pagina e riprova.');
                        window.location.reload();
                    }
                }
            };
        });
    }
    
    // Fix per il form della chat
    function fixChatForm() {
        const chatForm = document.getElementById('chat-form');
        if (!chatForm) return;
        
        // Rimuovi tutti gli event listener
        chatForm.onsubmit = null;
        
        // Aggiungi un handler semplice e diretto
        chatForm.onsubmit = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const input = document.getElementById('message-input');
            if (!input || !input.value.trim()) return false;
            
            const message = input.value.trim();
            console.log('Invio messaggio:', message);
            
            if (window.ChatCore?.handleMessageSubmit) {
                window.ChatCore.handleMessageSubmit(message);
            }
            
            return false;
        };
    }
    
    // Fix per il pulsante "Nuova chat"
    function fixNewChatButton() {
        const newChatBtn = document.getElementById('new-chat-btn');
        if (!newChatBtn) return;
        
        // Rimuovi handler esistenti
        newChatBtn.onclick = null;
        
        // Aggiungi un handler semplice
        newChatBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Creazione nuova chat');
            
            if (window.ChatCore?.createNewChat) {
                window.ChatCore.createNewChat();
            }
        };
    }
    
    // Fix per i suggerimenti nel messaggio di benvenuto
    function fixWelcomeSuggestions() {
        const suggestionChips = document.querySelectorAll('.suggestion-chip');
        if (suggestionChips.length === 0) return;
        
        console.log(`Sistemando ${suggestionChips.length} suggerimenti welcome`);
        
        suggestionChips.forEach(chip => {
            // Rimuovi handler esistenti
            chip.onclick = null;
            
            // Aggiungi handler semplice
            chip.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const message = this.getAttribute('data-message');
                if (!message) return;
                
                console.log('Suggerimento welcome cliccato:', message);
                
                if (window.ChatCore?.handleMessageSubmit) {
                    window.ChatCore.handleMessageSubmit(message);
                }
            };
        });
    }
    
    // Attendi che il DOM sia pronto
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(applyAllFixes, 100);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(applyAllFixes, 100);
        });
    }
    
    // Applica anche in caso di appReady
    document.addEventListener('appReady', function() {
        setTimeout(applyAllFixes, 200);
    });
    
    // Verifica periodicamente i pulsanti delete per 30 secondi
    let checkCount = 0;
    const checkInterval = setInterval(function() {
        checkCount++;
        fixDeleteButtons();
        
        if (checkCount >= 6) { // 6 volte x 5 secondi = 30 secondi
            clearInterval(checkInterval);
            console.log('Verifiche periodiche terminate');
        }
    }, 5000);
})();