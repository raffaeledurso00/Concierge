/**
 * preloader.js - Gestisce l'animazione di caricamento iniziale
 */

// Attendi che il DOM sia completamente caricato
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
    const counter = document.querySelector('.preloader__counter-current');
    const curtain = document.getElementById('js-page-transition-curtain');
    const cursor = document.getElementById('js-cursor');
    const chatContainer = document.querySelector('.chat-container');
    const innerCircle = document.querySelector('#js-preloader .preloader__circle #inner');
    const outerCircle = document.querySelector('#js-preloader .preloader__circle #outer');
    
    // Verifica che tutti gli elementi necessari esistano
    if (!preloader || !counter || !curtain || !chatContainer) {
        console.error('Elementi DOM mancanti. Il preloader non funzionerà correttamente.');
        hidePreloader();
        return;
    }
    
    console.log('Elementi preloader trovati:', {
        preloader: !!preloader,
        counter: !!counter,
        curtain: !!curtain,
        chatContainer: !!chatContainer,
        innerCircle: !!innerCircle,
        outerCircle: !!outerCircle
    });
    
    // Nascondi la chat container durante il preloader
    chatContainer.style.opacity = '0';
    
    // Inizia l'animazione del preloader
    const timeline = gsap.timeline();
    
    // Aggiunge la classe per il cursore di caricamento
    document.body.classList.add('cursor-progress');
    
    // Animazione dei cerchi SVG
    if (innerCircle && outerCircle && gsap.getProperty) {
        try {
            // Verifica se il plugin DrawSVG è disponibile
            if (innerCircle.drawSVG || gsap.plugins.drawSVG) {
                timeline.to(outerCircle, {
                    drawSVG: '0% 100%',
                    duration: 3,
                    ease: 'power4.out'
                }, 'start');
            } else {
                console.warn('Plugin DrawSVG non disponibile, utilizzo animazione alternativa');
                // Fallback se DrawSVG non è disponibile
                timeline.to(outerCircle, {
                    strokeDashoffset: 0,
                    duration: 3,
                    ease: 'power4.out'
                }, 'start');
            }
        } catch (e) {
            console.error('Errore nell\'animazione del cerchio:', e);
        }
    }
    
    // Animazione contatore
    timeline.to({ value: 0 }, {
        value: 100,
        duration: 3,
        ease: 'power4.out',
        onUpdate: function() {
            counter.textContent = Math.round(this.targets()[0].value);
        }
    }, 'start');
    
    // Dopo 3.5 secondi, completa l'animazione e mostra l'app
    setTimeout(function() {
        finishPreloader();
    }, 3500);
    
    // Funzione per completare l'animazione del preloader
    function finishPreloader() {
        const completeTimeline = gsap.timeline({
            onComplete: function() {
                // Nascondi completamente il preloader
                preloader.style.display = 'none';
                curtain.style.display = 'none';
                
                // Rimuovi la classe del cursore
                document.body.classList.remove('cursor-progress');
                
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
        
        // Completa l'animazione del contatore
        completeTimeline.to({}, {
            duration: 0.3,
            onUpdate: function() {
                counter.textContent = '100';
            }
        }, 'finish');
        
        // Mostra la tenda di transizione
        completeTimeline.set(curtain, {
            display: 'block',
            autoAlpha: 0
        }).to(curtain, {
            autoAlpha: 1,
            duration: 0.5
        }, 'finish+=0.2');
        
        // Nascondi il preloader
        completeTimeline.to(preloader, {
            autoAlpha: 0,
            duration: 0.6,
            ease: 'power3.inOut'
        }, 'finish+=0.4');
        
        // Mostra la chat container
        completeTimeline.to(chatContainer, {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.inOut'
        }, 'finish+=0.6');
        
        // Nascondi la tenda
        completeTimeline.to(curtain, {
            autoAlpha: 0,
            duration: 0.5
        }, 'finish+=0.9');
    }
    
    // Funzione di fallback per nascondere il preloader in caso di errori
    function hidePreloader() {
        if (preloader) preloader.style.display = 'none';
        if (chatContainer) chatContainer.style.opacity = '1';
        
        // Inizializza l'app
        if (typeof window.initializeApp === 'function') {
            window.initializeApp();
        } else {
            // Fallback: invia un evento che l'app è pronta
            const event = new Event('appReady');
            document.dispatchEvent(event);
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