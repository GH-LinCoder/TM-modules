// ./work/approfiles/selectApprofiles.js
import{executeIfPermitted} from '../../registry/executeIfPermitted.js';
import{showToast} from '../../ui/showToast.js';
import{appState} from '../../state/appState.js';


//A DEV only method of selecting an approfile using a populated dropdown ( from relateApprofiles.js)

console.log('selectApprofiles.js loaded');

export function render(panel, query = {}) {
    console.log('selectApprofiles.js render() called');  
    const dialog = new SelectDialog();dialog.render(panel, query);
  }

  class SelectDialog {
    constructor() {       
       this.approfiles = [];
       this.remember = [];
     }


     render(panel, query = {}) {
        console.log('SelectDialog.render()'); //
        // ✅ Now the panel exists — inject HTML
        panel.innerHTML = this.getTemplateHTML(); //
    


 
        this.dialog = panel.querySelector('[data-form="selectDialogue"]');
        this.form = panel.querySelector('[data-form="selectForm"]');
        this.informationFeedback = panel.querySelector('[data-task="information-feedback"]'); 

        this.chosenApprofile = panel.querySelector('[data-form="chosenApprofile"]');
  
        this.selectBtn = panel.querySelector('[data-form="selectBtn"]');
    
        // ✅ Now initialize event listeners
        this.init();
      }
      init() {
        console.log('selectDialogue.init()');  // 
        // Set up event listeners
        this.dialog.querySelectorAll('[data-action="close-dialog"]').forEach(el => {
          el.addEventListener('click', () => this.close());//why foreEach ?
        });
    
        this.selectBtn.addEventListener('click', (e) => this.handleselect(e));
    

        this.chosenApprofile.addEventListener('change', this.updateSubmitButtonState.bind(this));
        this.loadApprofiles();
    
        // Populate dropdowns when dialog opens
        this.dialog.addEventListener('open', () => { 
          console.log('dialog open'); 
          this.loadApprofiles();
        });
      }
    
      updateSubmitButtonState() {
        const chosenApprofile = this.chosenApprofile.value !== '';
    
        if (chosenApprofile) {
          this.selectBtn.disabled = false; 
          this.selectBtn.textContent = 'select one';
        };
    
        this.selectBtn.disabled = !(chosenApprofile);
      }
      
    
      open() {
        console.log('selectDialogue.open()');
        this.dialog.classList.remove('hidden');
        this.dialog.classList.add('flex');
        
        // Dispatch custom event
        this.dialog.dispatchEvent(new CustomEvent('dialog:open'));
      }
    
      close() {
        console.log('selectDialogue.close()');
    // should remove listeners see lines 210, 215-217, 221
    
        this.dialog.classList.add('hidden');
        this.dialog.classList.remove('flex');
        
        // Reset form
        this.form.reset();
        this.selectBtn.disabled = true;
      }
    
    
    
      getTemplateHTML() { console.log('getTemplateHTML()');
        return `
      <!-- selectApprofile html -->
    
    <div id="selectDialogue" data-form="selectDialogue" class="assign-relations-dialog  flex items-center justify-center">
    <!--div id="selectDialogue" data-form="selectDialogue" class="assign-relations-dialog  flex items-center justify-center"-->
    
    
      <!-- Dialog -->
      <div class="bg-white rounded-lg shadow-lg w-auto max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
    
         <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">select an Approfile</h3>
          <p class="text-sm text-gray-600">Dev method only</p>
    
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
        <div class="p-6 space-y-6">
      <div>
            
    
            <div class="space-y-2">
          <form id="selectForm" data-form="selectForm" class="space-y-4">
              <label for="chosenApprofile" class="block text-sm font-medium text-gray-700" data-form="dropdown-01">Select an approfile</label>
              <select 
                id="chosenApprofile" 
                data-form="chosenApprofile"
                class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a chosenApprofile</option>
              </select>
            </div>    
    
            <div class="text-sm text-gray-500 space-y-2 p-3 bg-gray-50 rounded-lg">
              <p>
                You can select any approfile. 
                Use the dropdown to select one and then click button to select it.
              </p>

              <p> DEV:
                Currently using 'name' from app_profiles table. Drop down will not scale. 
                Later will need search. Drop down populated from 'app_profiles' for people, tasks and abstract. No filters.
                The approfile_id appears below. It is also written into appState.query.remember[] as objects approfile_id:value
                You can load many as each is .push into the array.
              </p>
            </div>
    
            <button 
              type="submit" 
              id="selectBtn"
              data-form="selectBtn"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Awaitng selection
            </button>
          </form>
           <div class="bg-green-100 flex flex-col md:flex-row justify-center gap-4 pt-4 border-t border-gray-200">
       <p class="text-lg font-bold"> Information:</p><p data-task="information-feedback">??</>
       </div>    
        </div>
      </div>
    </div>
    </div>
    `;
    
      }

    
    // readApprofiles
        async loadApprofiles() {
          console.log('selectDialogue.loadApprofiles()');
          try {
            const approfiles = await executeIfPermitted(appState.query.userId, 'readApprofiles',{});
            this.approfiles = approfiles || [];
            this.populateapprofileDropdown();
          } catch (error) {
            console.error('Error fetching approfiles:', error);
            this.showError('Failed to load approfiles');
          } 
        }
    
    
      populateapprofileDropdown() {
        console.log('selectDialogue.populateapprofileDropdown()');
        // Clear existing options (except placeholders)
        this.chosenApprofile.innerHTML = '<option value="">Select Approfile</option>';

        this.approfiles.forEach(file => {
                 //      console.log('fileId',file.name);
          const chosenApprofileOption = document.createElement('option');
          chosenApprofileOption.value = file.id;
          chosenApprofileOption.textContent = file.name;
          this.chosenApprofile.appendChild(chosenApprofileOption);
        });
          this.informationFeedback.innerHTML =`Loaded`;
      }

      
      putRememberIntoAppState(){
        appState.query.remember = this.remember;
       console.log('query.remember:',appState.query.remember);
      }

      loadRemember(itemToRemember){
       console.log('itemToRemember:',itemToRemember);
        this.remember.push([itemToRemember]);
      //  console.log('local remember', this.remember);
      }

    
      async handleselect(e) {
        e.preventDefault();
        console.log('selectDialogue.handleselect(e)');
        this.selectBtn.disabled = true;
        const chosenApprofile_id = this.chosenApprofile.value;
      
        if (!chosenApprofile_id ) {
          return;
        }
          this.selectBtn.textContent = 'selectd!'+ chosenApprofile_id;
          this.selectBtn.disabled = true;

         this.informationFeedback.innerHTML =`id: ${chosenApprofile_id}`;
         this.loadRemember({'approfile_id': chosenApprofile_id});
         this.putRememberIntoAppState();

         //         appState.query.remember.forEach((element) =>
  //       this.informationFeedback.innerHTML +=`<p> appState.query.remember:${element}</p>`);
        }
      

      showSuccess(message) {
        // Simple toast implementation
        this.showToast(message, 'bg-green-600');
      }
    
      showError(message) {
        this.showToast(message, 'bg-red-600');
      }
    
      showToast(message, bgColor) {
        // Remove any existing toast
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
    
        const toast = document.createElement('div');
        toast.className = `toast fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white shadow-lg ${bgColor} transition-opacity duration-300`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 300);
        }, 5000);
      }
    }//end of class
    
    export {SelectDialog};

  