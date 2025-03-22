/**
 * Preloader.js - Gestisce l'animazione del preloader
 */

// Classe Preloader
class Preloader {
    constructor(options) {
      // Riferimenti ai DOM Elements
      this.scope = options.scope || document;
      this.target = options.target || document.getElementById('js-preloader');
      this.header = this.target.querySelector('.preloader__header');
      this.content = this.target.querySelector('.preloader__content');
      this.counter = this.target.querySelector('.preloader__counter-current');
      this.wrapperCircle = this.target.querySelector('.preloader__circle');
      
      // Opzioni per la tenda di transizione
      this.curtain = options.curtain || {
        element: document.getElementById('js-page-transition-curtain'),
        background: '#9f887c'
      };
      
      // Opzioni per il contatore
      this.counterOpts = options.counter || {
        easing: 'power4.out',
        duration: 15,
        start: 0,
        target: 100,
        prefix: '',
        suffix: ''
      };
      
      // Cursore personalizzato
      this.cursor = options.cursor || {
        element: document.getElementById('js-cursor'),
        offset: { top: 0, left: 0 }
      };
      
      this.timeline = gsap.timeline();
      this._setupCursor();
      this._bindEvents();
    }
    
    _setupCursor() {
      if (this.cursor && this.cursor.element) {
        gsap.set(this.cursor.element, { autoAlpha: 1 });
        
        this.cursor.follower = {};
        this.cursor.follower.element = this.cursor.element.querySelector('.cursor__follower');
        this.cursor.follower.inner = this.cursor.element.querySelector('#inner');
        this.cursor.follower.outer = this.cursor.element.querySelector('#outer');
        
        if (this.cursor.follower.element) {
          this.cursor.follower.size = {
            element: {
              width: this.cursor.follower.element.offsetWidth,
              height: this.cursor.follower.element.offsetHeight
            }
          };
        }
        
        if (this.wrapperCircle) {
          this.cursor.centerX = this.wrapperCircle.offsetWidth / 2;
          this.cursor.centerY = this.wrapperCircle.offsetHeight / 2;
        }
      }
    }
    
    _bindEvents() {
      window.addEventListener('mousemove', (e) => {
        window.mouseX = e.clientX;
        window.mouseY = e.clientY;
      });
    }
    
    start() {
      document.body.classList.add('cursor-progress');
      
      // Nascondi il contenitore principale
      const chatContainer = document.querySelector('.chat-container');
      if (chatContainer) {
        chatContainer.style.opacity = 0;
      }
      
      if (this.cursor && this.cursor.element && this.cursor.follower) {
        gsap.set(this.cursor.element, {
          display: 'block',
          top: '50%',
          left: '50%'
        });
        
        if (this.wrapperCircle && this.cursor.follower.element) {
          gsap.set(this.cursor.follower.element, {
            width: this.wrapperCircle.offsetWidth,
            height: this.wrapperCircle.offsetHeight
          });
        }
        
        if (this.cursor.follower.inner && this.cursor.follower.outer) {
          gsap.set([this.cursor.follower.inner, this.cursor.follower.outer], {
            attr: {
              cx: this.cursor.centerX,
              cy: this.cursor.centerY,
              r: this.cursor.centerX - 1
            }
          });
        }
      }
      
      // Avvia l'animazione del contatore e del cerchio
      this.timeline.clear();
      
      // Animazione cerchio
      if (this.cursor.follower && this.cursor.follower.outer) {
        this.timeline.to(this.cursor.follower.outer, {
          drawSVG: '0% 100%',
          duration: this.counterOpts.duration,
          ease: this.counterOpts.easing
        }, 'start');
      }
      
      // Animazione contatore
      let countValue = this.counterOpts.start;
      this.timeline.to({ value: countValue }, {
        value: this.counterOpts.target,
        duration: this.counterOpts.duration,
        ease: this.counterOpts.easing,
        onUpdate: () => {
          countValue = Math.round(gsap.getProperty(this.timeline.targets()[1], 'value'));
          if (this.counter) {
            this.counter.textContent = this.counterOpts.prefix + countValue + this.counterOpts.suffix;
          }
        }
      }, 'start');
    }
    
    finish() {
      return new Promise((resolve) => {
        this.timeline.clear();
        
        // Completa l'animazione del cerchio
        if (this.cursor.follower && this.cursor.follower.outer) {
          this.timeline.to(this.cursor.follower.outer, {
            drawSVG: '0% 100%',
            rotate: 0,
            duration: 1.2,
            ease: 'expo.inOut'
          }, 'start');
        }
        
        // Completa il contatore
        this.timeline.to({}, {
          duration: 1.2,
          onUpdate: () => {
            if (this.counter) {
              this.counter.textContent = this.counterOpts.prefix + this.counterOpts.target + this.counterOpts.suffix;
            }
          }
        }, 'start');
        
        // Mostra la tenda
        if (this.curtain && this.curtain.element) {
          this.timeline.set(this.curtain.element, {
            display: 'block',
            autoAlpha: 0
          }).to(this.curtain.element, {
            autoAlpha: 1,
            duration: 0.5
          }, 'start+=0.5');
        }
        
        // Anima il contenuto e il preloader
        if (this.content) {
          this.timeline.to(this.content, {
            y: -30,
            duration: 0.8,
            ease: 'power3.inOut'
          }, 'start+=0.7');
        }
        
        this.timeline.to(this.target, {
          autoAlpha: 0,
          duration: 0.8,
          ease: 'power3.inOut'
        }, 'start+=0.8');
        
        // Mostra il contenitore principale
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
          this.timeline.to(chatContainer, {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.inOut'
          }, 'start+=1.2');
        }
        
        // Nascondi la tenda
        if (this.curtain && this.curtain.element) {
          this.timeline.to(this.curtain.element, {
            autoAlpha: 0,
            duration: 0.6
          }, 'start+=1.4');
        }
        
        // Posiziona il cursore
        if (this.cursor && this.cursor.element) {
          this.timeline.set(this.cursor.element, {
            x: 0,
            y: 0,
            autoAlpha: 0,
            clearProps: 'top,left'
          }, 'start+=1.5');
        }
        
        // Nascondi definitivamente il preloader e completa
        this.timeline.set([this.target, this.curtain.element], {
          display: 'none'
        }).call(() => {
          document.body.classList.remove('cursor-progress');
          resolve(true);
        });
      });
    }
  }
  
  // Esporta per l'uso globale
  window.Preloader = Preloader;