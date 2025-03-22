/**
 * preloader.js - Gestisce l'animazione di caricamento iniziale con cerchio rotante
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Preloader initialization');
    
    // Verifica se GSAP è stato caricato correttamente
    if (typeof gsap === 'undefined') {
        console.error('GSAP non è stato caricato. Il preloader non funzionerà correttamente.');
        hidePreloader();
        return;
    }
    
    // Riferimenti elementi DOM
    const preloader = document.getElementById('js-preloader');
    const loadingCircle = document.getElementById('loading-circle');
    const preloaderLogo = document.getElementById('preloader-logo');
    const chatHeaderLogo = document.querySelector('.chat-header-logo');
    const chatContainer = document.querySelector('.chat-container');
    
    // Verifica che tutti gli elementi necessari esistano
    if (!preloader || !loadingCircle || !preloaderLogo || !chatContainer) {
        console.error('Elementi DOM mancanti. Il preloader non funzionerà correttamente.');
        hidePreloader();
        return;
    }
    
    // Nascondi la chat container durante il preloader
    chatContainer.style.opacity = '0';
    
    // Inizia l'animazione del preloader
    const timeline = gsap.timeline();
    
    // Animazione del cerchio di caricamento
    timeline.fromTo(loadingCircle, 
        { strokeDashoffset: 565.48 },
        { 
            strokeDashoffset: 0, 
            duration: 2.5, 
            ease: "power2.inOut",
            rotation: 360,
            transformOrigin: "center center",
            onComplete: finishPreloader
        }
    );
    
    // Aggiunge un'animazione di pulsazione al logo
    gsap.to(preloaderLogo, {
        scale: 1.05,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
    
// Funzione per completare l'animazione del preloader
function finishPreloader() {
    // Correggiamo il riferimento al logo nell'header
    const chatHeaderLogo = document.querySelector('.chat-header img'); // Modifichiamo questo selettore
    
    // Ottieni la posizione e le dimensioni
    const headerBounds = chatHeaderLogo ? chatHeaderLogo.getBoundingClientRect() : null;
    const preloaderLogoBounds = preloaderLogo.getBoundingClientRect();
    
    if (!headerBounds) {
        console.warn('Header logo not found, using fallback position');
        // Se non troviamo il logo nell'header, usiamo il centro dell'header
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            const headerBounds = chatHeader.getBoundingClientRect();
            // Calcola il centro dell'header
            const centerX = headerBounds.left + (headerBounds.width / 2);
            const centerY = headerBounds.top + (headerBounds.height / 2);
            
            // Calcola l'offset necessario
            const offsetX = centerX - (preloaderLogoBounds.left + preloaderLogoBounds.width / 2);
            const offsetY = centerY - (preloaderLogoBounds.top + preloaderLogoBounds.height / 2);
            
            // Aggiungi classe per abilitare la transizione
            preloaderLogo.classList.add('transitioning');
            
            // Anima il logo verso il centro dell'header
            gsap.to(preloaderLogo, {
                x: offsetX,
                y: offsetY,
                scale: 0.4, // Ridimensionamento adeguato per il logo nell'header
                duration: 0.8,
                ease: "power3.inOut",
                onComplete: completeTransition
            });
        } else {
            // Fallback se non troviamo nemmeno l'header
            fadeOutPreloader();
        }
    } else {
        // Se troviamo il logo nell'header, animiamo verso di esso
        const scaleX = headerBounds.width / preloaderLogoBounds.width;
        const scaleY = headerBounds.height / preloaderLogoBounds.height;
        const scale = Math.min(scaleX, scaleY);
        
        const offsetX = headerBounds.left + (headerBounds.width / 2) - (preloaderLogoBounds.left + preloaderLogoBounds.width / 2);
        const offsetY = headerBounds.top + (headerBounds.height / 2) - (preloaderLogoBounds.top + preloaderLogoBounds.height / 2);
        
        // Aggiungi classe per abilitare la transizione
        preloaderLogo.classList.add('transitioning');
        
        // Anima il logo verso la sua posizione nell'header
        gsap.to(preloaderLogo, {
            x: offsetX,
            y: offsetY,
            scale: scale,
            duration: 0.8,
            ease: "power3.inOut",
            onComplete: completeTransition
        });
    }
    
    // Fade out del cerchio di caricamento
    gsap.to(loadingCircle, {
        opacity: 0,
        duration: 0.6
    });
    
    // Fade out dello sfondo del preloader
    gsap.to(preloader, {
        backgroundColor: 'rgba(18, 18, 18, 0)',
        duration: 0.8
    });
    
    // Completa la transizione e inizializza l'app
    function completeTransition() {
        // Nascondi il preloader
        preloader.style.display = 'none';
        
        // Mostra la chat container
        gsap.to(chatContainer, {
            opacity: 1,
            duration: 0.4,
            onComplete: function() {
                // Rimuovi il logo di transizione
                if (preloaderLogo.parentNode) {
                    preloaderLogo.parentNode.removeChild(preloaderLogo);
                }
                
                // Inizializza l'app principale
                if (typeof window.initializeApp === 'function') {
                    window.initializeApp();
                } else {
                    console.warn('Function initializeApp not found, initializing app directly');
                    // Fallback: inizializza direttamente
                    const event = new Event('appReady');
                    document.dispatchEvent(event);
                }
            }
        });
    }
    
    // Fallback in caso di problemi
    function fadeOutPreloader() {
        gsap.to(preloader, {
            autoAlpha: 0,
            duration: 0.8,
            onComplete: function() {
                preloader.style.display = 'none';
                chatContainer.style.opacity = '1';
                
                // Inizializza l'app
                if (typeof window.initializeApp === 'function') {
                    window.initializeApp();
                } else {
                    const event = new Event('appReady');
                    document.dispatchEvent(event);
                }
            }
        });
    }
}
    
    // Gestione degli errori: se qualcosa va storto, nascondi il preloader dopo 5 secondi
    setTimeout(function() {
        if (preloader.style.display !== 'none') {
            console.warn('Preloader timeout: nascondo forzatamente');
            hidePreloader();
        }
    }, 5000);
});