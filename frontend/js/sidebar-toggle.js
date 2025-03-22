/**
 * sidebar-toggle.js - Gestisce la funzionalità di espansione/riduzione della sidebar
 * Versione aggiornata: sidebar completamente nascondibile con pulsante nell'header
 * e animazione di rotolamento
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inizializzazione controllo sidebar toggle - versione rotolamento');
    
    // Trova il pulsante di toggle e il contenitore principale
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const container = document.querySelector('.chat-container');
    
    // Se il pulsante non esiste, esci
    if (!sidebarToggleBtn) {
        console.error('Pulsante di toggle della sidebar non trovato');
        return;
    }
    
    // Funzione per verificare se siamo in modalità mobile
    function isMobileView() {
        return window.innerWidth <= 768;
    }
    
    // Funzione per gestire il toggle della sidebar
    function toggleSidebar() {
        // Se siamo in modalità mobile, non fare nulla con questo pulsante
        if (isMobileView()) return;
        
        // Reset delle animazioni prima di applicare la nuova
        sidebarToggleBtn.style.animation = 'none';
        sidebarToggleBtn.offsetHeight; // Trigger reflow per far ripartire l'animazione
        sidebarToggleBtn.style.animation = '';
        
        // Toggle della classe per nascondere completamente la sidebar
        container.classList.toggle('sidebar-hidden');
        
        // Salva lo stato nel localStorage per ricordarlo tra le sessioni
        const isHidden = container.classList.contains('sidebar-hidden');
        localStorage.setItem('sidebar_hidden', isHidden ? 'true' : 'false');
        
        console.log('Sidebar toggle stato: ' + (isHidden ? 'nascosta' : 'visibile'));
    }
    
    // Aggiungi evento di click al pulsante
    sidebarToggleBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Previeni il bubbling
        toggleSidebar();
    });
    
    // Ripristina lo stato salvato al caricamento della pagina
    function restoreSidebarState() {
        const isHidden = localStorage.getItem('sidebar_hidden') === 'true';
        
        // Applica lo stato solo se non siamo in modalità mobile
        if (!isMobileView() && isHidden) {
            container.classList.add('sidebar-hidden');
            console.log('Ripristinato stato sidebar: nascosta');
            
            // Reset dell'animazione per evitare che si attivi al caricamento
            sidebarToggleBtn.style.animation = 'none';
            setTimeout(() => {
                sidebarToggleBtn.style.animation = '';
            }, 10);
        } else {
            console.log('Ripristinato stato sidebar: visibile');
        }
    }
    
    // Gestione del ridimensionamento della finestra
    window.addEventListener('resize', function() {
        // Se torniamo in modalità desktop da mobile
        if (!isMobileView()) {
            // Ripristina lo stato salvato
            const isHidden = localStorage.getItem('sidebar_hidden') === 'true';
            if (isHidden && !container.classList.contains('sidebar-hidden')) {
                container.classList.add('sidebar-hidden');
                
                // Reset dell'animazione
                sidebarToggleBtn.style.animation = 'none';
                setTimeout(() => {
                    sidebarToggleBtn.style.animation = '';
                }, 10);
            }
        } 
        // Se passiamo a modalità mobile e la sidebar era nascosta
        else if (container.classList.contains('sidebar-hidden')) {
            container.classList.remove('sidebar-hidden');
        }
    });
    
    // Inizializza la pagina
    restoreSidebarState();
});