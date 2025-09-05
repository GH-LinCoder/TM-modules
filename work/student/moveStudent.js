console.log('moveStudent.js loaded');

export function render(panel, query = {}) {console.log('moveStudentStep.js render() called');const dialog = new moveStudentStep();dialog.render(panel, query);
}

    class moveStudentStep {
      constructor({ onAdvance, onReverse, onClose, onAction } = {}) {
        // Callback functions with defaults
        this.onAdvance = onAdvance || (() => {});
        this.onReverse = onReverse || (() => {});
        this.onClose = onClose || (() => {});
        this.onAction = onAction || (() => {});

        // DOM references - will be set when show is called
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
       * Creates the dialog element and injects it into the DOM
       * @returns {Promise<boolean>} Resolves with true if student was moved, false otherwise
       */
      async render(panel) {
        // Inject dialog HTML
        panel.innerHTML = this.getTemplateHTML();
        
        // Get DOM references
        
        this.dialog = panel.querySelector('#moveStudentStep');
        this.advanceButton = this.dialog.querySelector('#advanceButton');
        this.closeButtons = this.dialog.querySelectorAll('[data-action="close-dialog"]');
        this.actionButtons = this.dialog.querySelectorAll('[data-button]');
        this.currentStudentName = this.dialog.querySelector('#currentStudentName');
        this.nextStudentName = this.dialog.querySelector('#nextStudentName');
        this.currentStepCheckmark = this.dialog.querySelector('#currentStepCheckmark');
        this.forwardArrow = this.dialog.querySelector('#forwardArrow');
        this.backwardArrow = this.dialog.querySelector('#backwardArrow');
        
        //need the three other buttons

        // Create promise for the result
        this.promise = new Promise((resolve, reject) => {
          this.resolvePromise = resolve;
          this.rejectPromise = reject;
        });

        // Reset state
        this.pendingAdvance = false;
        this.advanceConfirmed = false;
        
        // Show the dialog
        this.dialog.style.display = 'flex';
        
        // Initialize event listeners
        this.initEventListeners();
        
        return this.promise;
      }
    



 getTemplateHTML() { console.log('getTemplateHTML()');
    return `   <style>
    /* Custom style for the arrow button */
    .advance-button {
      background-color: #3b82f6; /* Blue-600 */
      color: white;
      transition: background-color 0.2s ease-in-out;
      border-radius: 9999px; /* Full rounded */
      padding: 0.75rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      flex-shrink: 0;
    }
    .advance-button:hover {
      background-color: #2563eb; /* Blue-700 */
    }
  </style>

<div class="bg-gray-100 font-sans">

  <!-- Example button to trigger the dialogue for testing -->
  <!--div class="p-8 text-center">
    <button id="showDialogButton" class="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
      Show Task Dialogue
    </button>
  </div-->

  <!-- Advance Task Dialogue -->
  <div id="moveStudentStep" data-form="moveStudentStep" class=" relative w-full h-full flex items-center justify-center">
    <!--div id="advanceTaskDialog" data-form="advanceTaskDialog" class="relative z-10 w-full"-->
    <!-- Backdrop -->
    <!--div class="fixed inset-0 bg-black/80" data-action="close-dialog"></div-->

    <!-- Dialog Container -->
    <!--div class="bg-white rounded-lg shadow-lg w-full max-w-5xl mx-4 z-10 max-h-[90vh] overflow-y-auto"-->
    <div class="bg-white rounded-lg shadow-lg w-full mx-0 z-10">
      
      <!-- Close Button and Title -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold text-gray-900" data-form="title">Advance Task Step</h3>
          <button
            class="text-gray-500 hover:text-gray-700"
            data-action="close-dialog"
            aria-label="Close"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Main Content and Cards -->
      <div class="p-6 space-y-8">
        
        <!-- Step Cards and Advance Button -->
        <div class="flex flex-row items-center justify-center gap-6">

          <!-- Previous Step Card -->
          <div class="w-1/3 bg-gray-50 rounded-lg p-6 shadow-md border border-gray-200 relative" data-step='previous'>
            <div class="text-sm font-semibold text-gray-600 mb-2">Previous Step</div>
            <h4 class="text-lg font-bold" data-previous-title>Step 1: Introduction</h4>
            <p class="text-sm text-gray-500 mt-1" data-previous-description>
              Brief description of the previous task step.
            </p>
            <!-- Checkmark for previous step (always visible) -->
            <div class="absolute top-2 right-2 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <!-- Current Step Card -->
          <div class="w-1/3 bg-blue-50 rounded-lg p-6 shadow-md border border-blue-200 relative" data-step='current'>
            <div class="text-sm font-semibold text-blue-600 mb-2">Current Step</div>
            <h4 class="text-lg font-bold" data-current-title>Step 2: Component Architecture</h4>
            <p class="text-sm text-gray-600 mt-1" data-current-description>
              Learn about component composition and state management patterns.
            </p>
            <!-- Student card inside the current step -->
            <div id="currentStudentName" data-student='name' class="absolute -top-4 -left-4 bg-white rounded-full p-2 text-xs font-medium text-gray-700 shadow border border-gray-200">
              Student: Jane Doe
            </div>
            <!-- Checkmark for current step (initially hidden) -->
            <div id="currentStepCheckmark" class="hidden absolute top-2 right-2 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <!-- Advance/Reverse Button Container -->
          <div class="relative">
            <button id="advanceButton" class="advance-button" data-action="advance" aria-label="Advance task to next step">
              <svg id="forwardArrow" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 12h14" />
              </svg>
              <svg id="backwardArrow" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7M19 12h-14" />
              </svg>
              
            </button>
          </div>

          <!-- Next Step Card -->
          <div class="w-1/3 bg-green-50 rounded-lg p-6 shadow-md border border-green-200 relative" data-step='next'>
            <div class="text-sm font-semibold text-green-600 mb-2">Next Step</div>
            <h4 class="text-lg font-bold" data-next-title>Step 3: State Management</h4>
            <p class="text-sm text-gray-600 mt-1" data-next-description>
              Implement state management solutions with React Context or Redux.
            </p>
            <!-- Student card inside the next step -->
            <div id="nextStudentName" data-student='name' class="hidden absolute -top-4 -right-4 bg-white rounded-full p-2 text-xs font-medium text-gray-700 shadow border border-gray-200">
              Student: Jane Doe
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
          <button data-button='message-student' class="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Message Student
          </button>
          <button data-button='abandoned' class="flex-1 py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Abandoned
          </button>
          <button data-button='message-admin' class="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
            Message Admin
          </button>
        </div>

      </div>
    </div>
  </div>`;}
        



      initEventListeners() {
        // Remove existing listeners
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
            
            // Resolve with false when closed
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
        }, 200);

        this.currentStudentName.classList.add('hidden');
        this.nextStudentName.classList.remove('hidden');
        this.currentStepCheckmark.classList.remove('hidden');

        this.advanceButton.setAttribute('data-action', 'reverse');
        this.forwardArrow.classList.add('hidden');
        this.backwardArrow.classList.remove('hidden');

        // Set timeout to commit the advance
        this.commitTimeout = setTimeout(() => {
          this.pendingAdvance = false;
          this.advanceConfirmed = true;
          
          // Disable the button
          this.advanceButton.disabled = true;
          this.advanceButton.style.opacity = '0.5';
          this.advanceButton.style.cursor = 'not-allowed';
          
          // Trigger callback and resolve promise
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
          this.revertVisuals();
          
          // Enable the button
          this.advanceButton.disabled = false;
          this.advanceButton.style.opacity = '1';
          this.advanceButton.style.cursor = 'pointer';
          
          return;
        }

        if (this.advanceConfirmed) {
          this.advanceConfirmed = false;
          this.revertVisuals();
          
          // Enable the button
          this.advanceButton.disabled = false;
          this.advanceButton.style.opacity = '1';
          this.advanceButton.style.cursor = 'pointer';
          
          // Resolve with false
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
          this.dialog.style.display = 'none';
        }
        this.onClose();
      }

      destroy() {
        clearTimeout(this.commitTimeout);
        
        if (this.controller) {
          this.controller.abort();
        }
        
        // Remove dialog from DOM
        if (this.dialog && this.dialog.parentElement) {
          this.dialog.parentElement.removeChild(this.dialog);
        }
        
        // Reject promise if it exists
        if (this.rejectPromise) {
          this.rejectPromise(new Error('Dialog destroyed'));
          this.resolvePromise = null;
          this.rejectPromise = null;
        }
      }
    }


    export {moveStudentStep}


