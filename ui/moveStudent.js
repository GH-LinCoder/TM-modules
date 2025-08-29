class AdvanceTaskDialog {
    constructor({ onAdvance, onReverse, onClose, onAction }) {
      // Callback functions
      this.onAdvance = onAdvance || (() => {});
      this.onReverse = onReverse || (() => {});
      this.onClose = onClose || (() => {});
      this.onAction = onAction || (() => {});
  
      // DOM references
      this.dialog = document.getElementById('advanceTaskDialog');
      this.advanceButton = this.dialog.querySelector('#advanceButton');
      this.closeButtons = this.dialog.querySelectorAll('[data-action="close-dialog"]');
      this.actionButtons = this.dialog.querySelectorAll('[data-button]');
  
      this.currentStudentName = this.dialog.querySelector('#currentStudentName');
      this.nextStudentName = this.dialog.querySelector('#nextStudentName');
      this.currentStepCheckmark = this.dialog.querySelector('#currentStepCheckmark');
      this.forwardArrow = this.dialog.querySelector('#forwardArrow');
      this.backwardArrow = this.dialog.querySelector('#backwardArrow');
  
      // State
      this.commitTimeout = null;
      this.pendingAdvance = false;
      this.advanceConfirmed = false;
  
      // Event controller for cleanup
      this.controller = new AbortController();
  
      this.initEventListeners();
    }
  
    initEventListeners() {
      // Close buttons
      this.closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.hide();
          this.onClose();
        }, { signal: this.controller.signal });
      });
  
      // Advance/reverse button
      this.advanceButton.addEventListener('click', (e) => {
        e.preventDefault();
        const action = this.advanceButton.getAttribute('data-action');
        if (action === 'advance') {
          this.handleAdvance();
        } else if (action === 'reverse') {
          this.handleReverse();
        }
      }, { signal: this.controller.signal });
  
      // Action buttons
      this.actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const action = e.target.getAttribute('data-button');
          this.onAction(action);
        }, { signal: this.controller.signal });
      });
    }
  
    handleAdvance() {
      this.pendingAdvance = true;
  
      // Visual feedback
      this.currentStudentName.classList.add('scale-110');
      setTimeout(() => {
        this.currentStudentName.classList.remove('scale-110');
      }, 2000);
  
      this.currentStudentName.classList.add('hidden');
      this.nextStudentName.classList.remove('hidden');
      this.currentStepCheckmark.classList.remove('hidden');
  
      this.advanceButton.setAttribute('data-action', 'reverse');
      this.forwardArrow.classList.add('hidden');
      this.backwardArrow.classList.remove('hidden');
  
      console.log('Task advancement started. Changes are pending...');
  
      this.commitTimeout = setTimeout(() => {
        this.pendingAdvance = false;
        this.advanceConfirmed = true;
        console.log('Task advancement confirmed - triggering callback');
        this.onAdvance();
      }, 2000);
    }
  
    handleReverse() {
      if (this.pendingAdvance) {
        clearTimeout(this.commitTimeout);
        this.pendingAdvance = false;
        console.log('Advance cancelled before confirmation');
        this.revertVisuals();
        return;
      }
  
      if (this.advanceConfirmed) {
        this.advanceConfirmed = false;
        console.log('Advance reversed after confirmation');
        this.revertVisuals();
        this.onReverse();
      }
    }
  
    revertVisuals() {
      this.currentStudentName.classList.remove('hidden');
      this.nextStudentName.classList.add('hidden');
      this.currentStepCheckmark.classList.add('hidden');
  
      this.advanceButton.setAttribute('data-action', 'advance');
      this.forwardArrow.classList.remove('hidden');
      this.backwardArrow.classList.add('hidden');
    }
  
    show() {
      this.dialog.classList.remove('hidden');
      this.dialog.classList.add('block');
    }
  
    hide() {
      this.dialog.classList.add('hidden');
      this.dialog.classList.remove('block');
      this.onClose();
    }
  
    destroy() {
      clearTimeout(this.commitTimeout);
      this.controller.abort(); // Removes all listeners
    }
  }
  
  export default AdvanceTaskDialog;
  