/**
 * sidebar-toggle.js - Gestisce la funzionalità di espansione/riduzione della sidebar in modalità desktop
 */

document.addEventListener('DOMContentLoaded', function() {
    // Trova il pulsante di toggle
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    
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
        // Se siamo in modalità mobile, non fare nulla
        if (isMobileView()) return;
        
        // Toggle della classe per collassare la sidebar
        document.body.classList.toggle('sidebar-collapsed');
        
        // Salva lo stato nel localStorage per ricordarlo tra le sessioni
        const isCollapsed = document.body.classList.contains('sidebar-collapsed');
        localStorage.setItem('sidebar_collapsed', isCollapsed ? 'true' : 'false');
    }
    
    // Aggiungi evento di click al pulsante
    sidebarToggleBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Previeni il bubbling
        toggleSidebar();
    });
    
    // Ripristina lo stato salvato al caricamento della pagina
    function restoreSidebarState() {
        const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
        
        // Applica lo stato solo se non siamo in modalità mobile
        if (isCollapsed && !isMobileView()) {
            document.body.classList.add('sidebar-collapsed');
        }
    }
    
    // Aggiungi listener per i cambiamenti della dimensione della finestra
    window.addEventListener('resize', function() {
        // Se torniamo in modalità desktop da mobile e la sidebar era collassata, ripristina lo stato
        if (!isMobileView()) {
            restoreSidebarState();
        }
        // Se passiamo a modalità mobile, assicuriamoci che la sidebar non sia collassata
        else if (document.body.classList.contains('sidebar-collapsed')) {
            document.body.classList.remove('sidebar-collapsed');
        }
    });
    
    // Ripristina lo stato al caricamento
    restoreSidebarState();
});