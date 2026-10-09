class AdvanceTaskDialog {
  constructor({ onAdvance, onReverse, onClose, onAction }) {
    // Callback functions
    this.onAdvance = onAdvance || (() => {});
    this.onReverse = onReverse || (() => {});
    this.onClose = onClose || (() => {});
    this.onAction = onAction || (() => {});

    // DOM references - initialized in show method
    this.dialog = null;
    this.advanceButton = null;
    this.closeButtons = null;
    this.actionButtons = null;
    this.currentStudentName = null;
    this.nextStudentName = null;
    this.currentStepCheckmark = null;
    this.forwardArrow = null;
    this.backwardArrow = null;

    // State
    this.commitTimeout = null;
    this.pendingAdvance = false;
    this.advanceConfirmed = false;
    this.resolvePromise = null;
    this.rejectPromise = null;
    this.promise = null;
    this.controller = null;
  }

  /**
   * Shows the dialog and returns a promise that resolves with a boolean
   * indicating whether the student was moved (true) or stayed (false)
   * @returns {Promise<boolean>}
   */
  show() {
    // Get DOM references (assuming HTML is already in the DOM)
    this.dialog = document.getElementById('advanceTaskDialog');
    this.advanceButton = this.dialog.querySelector('#advanceButton');
    this.closeButtons = this.dialog.querySelectorAll('[data-action="close-dialog"]');
    this.actionButtons = this.dialog.querySelectorAll('[data-button]');
    this.currentStudentName = this.dialog.querySelector('#currentStudentName');
    this.nextStudentName = this.dialog.querySelector('#nextStudentName');
    this.currentStepCheckmark = this.dialog.querySelector('#currentStepCheckmark');
    this.forwardArrow = this.dialog.querySelector('#forwardArrow');
    this.backwardArrow = this.dialog.querySelector('#backwardArrow');

    // Create a new promise that will resolve when the action is committed
    this.promise = new Promise((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
    });

    // Show the dialog
    this.dialog.classList.remove('hidden');
    this.dialog.classList.add('block');
    
    // Reset state
    this.pendingAdvance = false;
    this.advanceConfirmed = false;
    
    // Initialize event listeners
    this.initEventListeners();
    
    return this.promise;
  }

  initEventListeners() {
    // Remove existing listeners if any
    if (this.controller) {
      this.controller.abort();
    }
    
    this.controller = new AbortController();

    // Close buttons
    this.closeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.hide();
        this.onClose();
        
        // Resolve the promise with false when closed
        if (this.resolvePromise) {
          this.resolvePromise(false);
          this.resolvePromise = null;
          this.rejectPromise = null;
        }
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

    // Set timeout to commit the advance
    this.commitTimeout = setTimeout(() => {
      this.pendingAdvance = false;
      this.advanceConfirmed = true;
      console.log('Task advancement confirmed - triggering callback');
      
      // Disable the button after confirmation
      this.advanceButton.disabled = true;
      this.advanceButton.classList.add('opacity-50', 'cursor-not-allowed');
      
      // Trigger callback and resolve promise with true (student was moved)
      this.onAdvance();
      if (this.resolvePromise) {
        this.resolvePromise(true);
        this.resolvePromise = null;
        this.rejectPromise = null;
      }
    }, 2000);
  }

  handleReverse() {
    if (this.pendingAdvance) {
      clearTimeout(this.commitTimeout);
      this.pendingAdvance = false;
      console.log('Advance cancelled before confirmation');
      this.revertVisuals();
      
      // Enable the button again
      this.advanceButton.disabled = false;
      this.advanceButton.classList.remove('opacity-50', 'cursor-not-allowed');
      
      return;
    }

    if (this.advanceConfirmed) {
      this.advanceConfirmed = false;
      console.log('Advance reversed after confirmation');
      this.revertVisuals();
      
      // Enable the button again
      this.advanceButton.disabled = false;
      this.advanceButton.classList.remove('opacity-50', 'cursor-not-allowed');
      
      // Resolve the promise with false (student was moved back)
      if (this.resolvePromise) {
        this.resolvePromise(false);
        this.resolvePromise = null;
        this.rejectPromise = null;
      }
      
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

  hide() {
    if (this.dialog) {
      this.dialog.classList.add('hidden');
      this.dialog.classList.remove('block');
    }
    this.onClose();
  }

  destroy() {
    clearTimeout(this.commitTimeout);
    
    // Remove event listeners
    if (this.controller) {
      this.controller.abort();
    }
    
    // Reject promise if it exists
    if (this.rejectPromise) {
      this.rejectPromise(new Error('Dialog destroyed'));
      this.resolvePromise = null;
      this.rejectPromise = null;
    }
  }
}

export default AdvanceTaskDialog;
