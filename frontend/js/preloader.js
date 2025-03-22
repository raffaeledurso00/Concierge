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
            onComplete: completePreloader
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
    
    // Nuova funzione semplificata per completare il preloader
    function completePreloader() {
        console.log('Completing preloader animation');
        
        // Interrompi l'animazione di pulsazione del logo
        gsap.killTweensOf(preloaderLogo);
        
        // Anima la dissolvenza di tutto il preloader
        gsap.to(preloader, {
            autoAlpha: 0,
            duration: 0.8,
            onComplete: function() {
                // Nascondi completamente il preloader
                preloader.style.display = 'none';
                
                // Mostra l'interfaccia della chat con un'animazione di dissolvenza
                gsap.to(chatContainer, {
                    opacity: 1,
                    duration: 0.6,
                    onComplete: function() {
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
        });
    }
    
    // Gestione degli errori: se qualcosa va storto, nascondi il preloader dopo 5 secondi
    setTimeout(function() {
        if (preloader.style.display !== 'none') {
            console.warn('Preloader timeout: nascondo forzatamente');
            hidePreloader();
        }
    }, 5000);
    
    // Funzione per nascondere forzatamente il preloader
    function hidePreloader() {
        if (preloader) {
            preloader.style.display = 'none';
            if (chatContainer) {
                chatContainer.style.opacity = '1';
            }
            
            const event = new Event('appReady');
            document.dispatchEvent(event);
        }
    }
});