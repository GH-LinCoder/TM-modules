//moveStudent.js
// module self contained class for a step manager to move the student by one step, or not. Also 'abandon', 'message student', 'message admin' buttons
console.log('Loaded: moveStudent.js');
  
export class MoveStudentStep {
  constructor({ onAdvance, onReverse, onClose, onAction } = {}) {
    this.onAdvance = onAdvance || (() => {});
    this.onReverse = onReverse || (() => {});
    this.onClose = onClose || (() => {});
    this.onAction = onAction || (() => {});
    this.dialog = null;
    this.advanceButton = null;
    this.closeButtons = null;
    this.actionButtons = null;
    this.currentStudentName = null;
    this.nextStudentName = null;
    this.currentStepCheckmark = null;
    this.forwardArrow = null;
    this.backwardArrow = null;
    this.commitTimeout = null;
    this.pendingAdvance = false;
    this.advanceConfirmed = false;
    this.resolvePromise = null;
    this.rejectPromise = null;
    this.promise = null;
    this.controller = null;
    this.studentReaction = null;
  }

  async show(panel) {
    console.log('MoveStudentStep.show()');
    if (!panel) throw new Error('No panel provided to MoveStudentStep.show()');

    if (!document.getElementById('moveStudentStep')) {
      await this.createDialogElement(panel);
    }

    this.dialog = document.getElementById('moveStudentStep');
    this.advanceButton = this.dialog.querySelector('#advanceButton');
    this.closeButtons = this.dialog.querySelectorAll('[data-action="close-dialog"]');
    this.actionButtons = this.dialog.querySelectorAll('[data-button]');
    this.currentStudentName = this.dialog.querySelector('#currentStudentName');
    this.nextStudentName = this.dialog.querySelector('#nextStudentName');
    this.currentStepCheckmark = this.dialog.querySelector('#currentStepCheckmark');
    this.forwardArrow = this.dialog.querySelector('#forwardArrow');
    this.backwardArrow = this.dialog.querySelector('#backwardArrow');

    this.promise = new Promise((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
    });

    this.pendingAdvance = false;
    this.advanceConfirmed = false;
    this.studentReaction = {
      movedStep: false,
      abandoned: false,
      messageStudent: false,
      messageManager: false
    };

    this.dialog.style.display = 'flex';
    this.initEventListeners();

    return this.promise;
  }

  async createDialogElement(panel) {
    console.log('MoveStudentStep.createDialogElement()');
    if (!panel) throw new Error('No panel provided to createDialogElement');
    const dialogHtml = `
    <style>
    /* Dialog styles */
    #moveStudentStep {
      display: none;
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .dialog-content {
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .dialog-title {
      font-size: 1.125rem;
      font-weight: 600;
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
    }
    
    .close-button:hover {
      color: #374151;
    }
    
    .student-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    
    .student-name {
      font-weight: 500;
      color: #1f2937;
    }
    
    .checkmark {
      margin-left: 8px;
      color: #10b981;
    }
    
    .hidden {
      display: none;
    }
    
    .scale-110 {
      transform: scale(1.1);
      transition: transform 0.2s ease;
    }
    
    .action-button {
      background-color: #3b82f6;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: background-color 0.2s;
    }
    
    .action-button:hover:not(:disabled) {
      background-color: #2563eb;
    }
    
    .action-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .arrow-icon {
      margin-left: 8px;
      width: 20px;
      height: 20px;
    }
    
    .button-container {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    
    .secondary-button {
      background-color: #e5e7eb;
      color: #374151;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    }
    
    .secondary-button:hover {
      background-color: #d1d5db;
    }
    
    .primary-button {
      background-color: #10b981;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    }
    
    .primary-button:hover {
      background-color: #059669;
    }
  </style>
      <div id="moveStudentStep">
        <div class="dialog-content">
          <div class="dialog-header">
            <h3 class="dialog-title">Advance Student</h3>
            <button data-action="close-dialog" class="close-button">&times;</button>
          </div>
          <div class="student-container">
            <div class="student-info">
              <span id="currentStudentName" class="student-name">John Doe</span>
              <svg id="currentStepCheckmark" class="checkmark hidden" ...></svg>
            </div>
            <div class="student-info">
              <span id="nextStudentName" class="student-name hidden">Jane Smith</span>
            </div>
          </div>
          <div style="display: flex; justify-content: center; margin-bottom: 24px;">
            <button id="advanceButton" data-action="advance" class="action-button">
              <span>Advance</span>
              <svg id="forwardArrow" class="arrow-icon" ...></svg>
              <svg id="backwardArrow" class="arrow-icon hidden" ...></svg>
            </button>
          </div>
          <div class="button-container">
            <button data-button="message-student" class="secondary-button">Message Student</button>
            <button data-button="abandoned" class="secondary-button">Abandoned</button>
            <button data-button="message-admin" class="secondary-button">Message Admin</button>
          </div>
        </div>
      </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = dialogHtml.trim();
    panel.appendChild(tempDiv.firstElementChild);
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  initEventListeners() {
    console.log('MoveStudentStep.initEventListeners()');
    clearTimeout(this.commitTimeout);
    if (this.controller) this.controller.abort();
    this.controller = new AbortController();

    this.closeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.hide();
        this.onClose();
        if (this.resolvePromise) {
          this.resolvePromise(this.studentReaction);
          this.resolvePromise = null;
          this.rejectPromise = null;
        }
      }, { signal: this.controller.signal });
    });

    this.advanceButton.addEventListener('click', (e) => {
      e.preventDefault();
      const action = this.advanceButton.getAttribute('data-action');
      if (action === 'advance') {
        this.handleAdvance();
      } else if (action === 'reverse') {
        this.handleReverse();
      }
    }, { signal: this.controller.signal });

    this.actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const action = e.target.getAttribute('data-button');
        if (action === 'message-student') this.studentReaction.messageStudent = true;
        if (action === 'abandoned') this.studentReaction.abandoned = true;
        if (action === 'message-admin') this.studentReaction.messageManager = true;

        this.onAction(action);
        if (this.resolvePromise) {
          this.resolvePromise(this.studentReaction);
          this.resolvePromise = null;
          this.rejectPromise = null;
        }
        this.hide();
      }, { signal: this.controller.signal });
    });
  }

  handleAdvance() {
    this.pendingAdvance = true;
    this.currentStudentName.classList.add('scale-110');
    setTimeout(() => this.currentStudentName.classList.remove('scale-110'), 200);
    this.currentStudentName.classList.add('hidden');
    this.nextStudentName.classList.remove('hidden');
    this.currentStepCheckmark.classList.remove('hidden');
    this.advanceButton.setAttribute('data-action', 'reverse');
    this.forwardArrow.classList.add('hidden');
    this.backwardArrow.classList.remove('hidden');

    this.commitTimeout = setTimeout(() => {
      this.pendingAdvance = false;
      this.advanceConfirmed = true;
      this.advanceButton.disabled = true;
      this.advanceButton.style.opacity = '0.5';
      this.advanceButton.style.cursor = 'not-allowed';
      this.studentReaction.movedStep = true;
      this.onAdvance();
      if (this.resolvePromise) {
        this.resolvePromise(this.studentReaction);
        this.resolvePromise = null;
        this.rejectPromise = null;
      }
    }, 2000);
  }

  handleReverse() {
    if (this.pendingAdvance) {
      clearTimeout(this.commitTimeout);
      this.pendingAdvance = false;
      this.revertVisuals();
      this.advanceButton.disabled = false;
      this.advanceButton.style.opacity = '1';
      this.advanceButton.style.cursor = 'pointer';
      return;
    }

    if (this.advanceConfirmed) {
      this.advanceConfirmed = false;
      this.revertVisuals();
      this.advanceButton.disabled = false;
      this.advanceButton.style.opacity = '1';
      this.advanceButton.style.cursor = 'pointer';
      this.studentReaction.movedStep = false;
      if (this.resolvePromise) {
        this.resolvePromise(this.studentReaction);
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
    if (this.dialog) this.dialog.style.display = 'none';
    this.onClose();
  }

  destroy() {
    clearTimeout(this.commitTimeout);
    if (this.controller) this.controller.abort();
    if (this.dialog?.parentElement) this.dialog.parentElement.removeChild(this.dialog);
    if (this.rejectPromise) {
      this.rejectPromise(new Error('Dialog destroyed'));
      this.resolvePromise = null;
      this.rejectPromise = null;
    }
  }
}
