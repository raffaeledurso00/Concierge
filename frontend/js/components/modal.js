// frontend/js/components/modal.js
// Gestione delle finestre modali

const ModalComponent = {
    /**
     * Mostra una finestra modale con messaggio e callback di conferma
     * @param {string} message - Messaggio da mostrare
     * @param {Function} confirmCallback - Funzione da chiamare in caso di conferma
     */
    showModal: function(message, confirmCallback) {
      const modal = document.getElementById('custom-modal');
      const modalMessage = document.getElementById('modal-message');
      const confirmBtn = document.getElementById('modal-confirm-btn');
      const cancelBtn = document.getElementById('modal-cancel-btn');
      
      if (!modal || !modalMessage || !confirmBtn || !cancelBtn) {
        console.error('Elementi del modal non trovati');
        return;
      }
      
      // Imposta il messaggio
      modalMessage.textContent = message;
      
      // Mostra il modale
      modal.classList.add('show');
      
      // Gestisci i pulsanti
      const handleConfirm = () => {
        modal.classList.remove('show');
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        if (typeof confirmCallback === 'function') {
          confirmCallback();
        }
      };
      
      const handleCancel = () => {
        modal.classList.remove('show');
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
      };
      
      // Rimuovi eventuali listener precedenti per evitare duplicati
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      
      // Aggiungi i nuovi listener
      confirmBtn.addEventListener('click', handleConfirm);
      cancelBtn.addEventListener('click', handleCancel);
    }
  };
  
  // Esporta il modulo
  window.ModalComponent = ModalComponent;