/**
 * Preloader.js - Gestisce l'animazione del preloader
 */

// Classe Preloader
class Preloader {
    constructor(options) {
      // Riferimenti ai DOM Elements
      this.$document = options.scope || $(document);
      this.$target = options.target || $('#js-preloader');
      this.$header = this.$target.find('.preloader__header');
      this.$content = this.$target.find('.preloader__content');
      this.$counter = this.$target.find('.preloader__counter-current');
      this.$wrapperCircle = this.$target.find('.preloader__circle');
      
      // Opzioni per la tenda di transizione
      this.curtain = options.curtain || {
        element: $('#js-page-transition-curtain'),
        background: '#9f887c'
      };
      
      // Altre inizializzazioni...
    }
    
    // Metodi della classe...
  }
  
  // Esporta per l'uso globale
  window.Preloader = Preloader;