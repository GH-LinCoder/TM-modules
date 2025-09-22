// relate.js
import{executeIfPermitted} from '../../registry/executeIfPermitted.js';
import{showToast} from '../../ui/showToast.js';
import{appState} from '../../state/appState.js';


console.log('relateApprofiles.js');


export function render(panel, query = {}) {
  console.log('realteApprofiles.js render() called');  
  const dialog = new RelateDialog();dialog.render(panel, query);
}



class RelateDialog {
 constructor() {
    // ✅ Remove DOM references from constructor
    this.relationship  = [];
    this.approfiles = [];
    // No DOM elements here
  }

  render(panel, query = {}) {
    console.log('RealateDialog.render()'); //
    // ✅ Now the panel exists — inject HTML
    panel.innerHTML = this.getTemplateHTML(); //

    // ✅ Now select elements from the injected DOM
    this.dialog = panel.querySelector('[data-form="relateDialog"]');
    this.form = panel.querySelector('[data-form="relateForm"]');
    this.relationSelect = panel.querySelector('[data-form="relationSelect"]');
    this.approfile_is = panel.querySelector('[data-form="approfile_is"]');
    this.of_approfile = panel.querySelector('[data-form="of_approfile"]');
    this.assignBtn = panel.querySelector('[data-form="relateBtn"]');

    // ✅ Now initialize event listeners
    this.init();
  }
  init() {
    console.log('relateDialog.init()');  // 
    // Set up event listeners
    this.dialog.querySelectorAll('[data-action="close-dialog"]').forEach(el => {
      el.addEventListener('click', () => this.close());//why foreEach ?
    });

    this.assignBtn.addEventListener('click', (e) => this.handleRelate(e));

    this.relationSelect.addEventListener('change', this.updateSubmitButtonState.bind(this));
    this.approfile_is.addEventListener('change', this.updateSubmitButtonState.bind(this));
    this.of_approfile.addEventListener('change', this.updateSubmitButtonState.bind(this));
    
    this.loadrelations ();  
    this.loadApprofiles();

    // Populate dropdowns when dialog opens, but this never happens so moved functions above
    this.dialog.addEventListener('open', () => { // delete???
      console.log('dialog open'); // FAILS no log <-------------------------  doesn't know it is open
      this.loadrelations ();
      this.loadApprofiles();
    });
  }

  updateSubmitButtonState() {
    const relationSelected = this.relationSelect.value !== '';
    const approfile_is = this.approfile_is.value !== '';
    const of_approfile = this.of_approfile.value !== '';

    if (relationSelected && approfile_is && of_approfile) {
      this.assignBtn.disabled = false; //only enable submit when all three selected (relations, approfile_is, of_approfile)
      this.assignBtn.textContent = 'Relate them';

    };


    this.assignBtn.disabled = !(relationSelected && approfile_is && of_approfile);
  }
  

  open() {
    console.log('relateDialog.open()');
    this.dialog.classList.remove('hidden');
    this.dialog.classList.add('flex');
    
    // Dispatch custom event
    this.dialog.dispatchEvent(new CustomEvent('dialog:open'));
  }

  close() {
    console.log('relateDialog.close()');
// should remove listeners see lines 210, 215-217, 221

    this.dialog.classList.add('hidden');
    this.dialog.classList.remove('flex');
    
    // Reset form
    this.form.reset();
    this.assignBtn.disabled = true;
  }



  getTemplateHTML() { console.log('getTemplateHTML()');
    return `
  <!-- assign-relations-dialog.html -->

<div id="relateDialog" data-form="relateDialog" class="assign-relations-dialog  flex items-center justify-center">
<!--div id="relateDialog" data-form="relateDialog" class="assign-relations-dialog  flex items-center justify-center"-->


  <!-- Dialog -->
  <div class="bg-white rounded-lg shadow-lg w-auto max-w-4xl mx-4 z-10 max-h-[90vh] overflow-y-auto">

     <div class="p-6 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Relate Approfiles</h3>
      <p class="text-sm text-gray-600">Assign a relationship between two approfiles</p>

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
      <form id="relateForm" data-form="relateForm" class="space-y-4">
          <label for="approfile_is" class="block text-sm font-medium text-gray-700" data-form="dropdown-01">Select an approfile then a relationship, to another approfile</label>
          <select 
            id="approfile_is" 
            data-form="approfile_is"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a approfile_is</option>
          </select>
        </div>

<div class="space-y-2">
          <label for="relationSelect" class="block text-sm font-medium text-gray-700" data-form="title">Three dropdown choices needed</label>
          <select 
            id="relationSelect" 
            data-form="relationSelect"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a relationship</option>
          </select>
        </div>


        <div class="space-y-2">
          <label for="of_approfile" class="block text-sm font-medium text-gray-700" data-form="dropdown-02">How the first relates to the second</label>
          <select 
            id="of_approfile" 
            data-form="of_approfile"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select of_approfile</option>
          </select>
        </div>

        <div class="text-sm text-gray-500 space-y-2 p-3 bg-gray-50 rounded-lg">
          <p>
            You can assign any approfile to any relation and select any approfile that you want to relate it to. 
            Use the dropdowns to select each one and then click to relate it.
          </p>
          <p>This relationship can be read, in ungrammitcal English as 'this approfile is (relationship) of that approfile. Such as: John is employee of Gem co. In this 'John' is represented by an 'approfile' and he comes the approfile_is while 'Gem co' is also represnted as an approfile and it becomes the of_approfile.</p>
          <p> DEV:
            Currently using 'name' from app_profiles table. Drop down will not scale. 
            Later will need search. Drop down populated from 'app_profiles' for people and 'relationships' . 
            Written to approfile_relations.
          </p>
        </div>

        <button 
          type="submit" 
          id="relateBtn"
          data-form="relateBtn"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
        >
          Assign relations awaitng selections
        </button>
      </form>
    </div>
  </div>
</div>
</div>
`;

  }
  
 // read relations_ 
  async loadrelations () {
    console.log('relateDialog.loadrelations ()');
    try {//the function returns id, name, category, description, created_at
      const relations  = await executeIfPermitted(appState.query.userId, 'readRelationships', {});
      this.relations  = relations  || [];
      this.populaterelationsDropdown();
    } catch (error) {
      console.error('Error fetching relations  :', error);
      this.showError('An unexpected error occurred');
    }
  }


// readApprofiles
    async loadApprofiles() {
      console.log('relateDialog.loadApprofiles()');
      try {
        const approfiles = await executeIfPermitted(appState.query.userId, 'readApprofiles',{});
        this.approfiles = approfiles || [];
        this.populateapprofileDropdowns();
      } catch (error) {
        console.error('Error fetching approfiles:', error);
        this.showError('Failed to load approfiles');
      } 
    }
    

  populaterelationsDropdown() {
    console.log('relateDialog.populaterelationsDropdown()');
    this.relationSelect.innerHTML = '<option value="">Select relationship</option>';
    
    this.relations .forEach(relations => {
      const option = document.createElement('option');
      option.value = relations.name;
      option.textContent = relations.name + '~~~~~~ [category:'+ relations.category +']';
      this.relationSelect.appendChild(option);
    });
  }

  populateapprofileDropdowns() {
    console.log('relateDialog.populateapprofileDropdowns()');
    // Clear existing options (except placeholders)
    this.approfile_is.innerHTML = '<option value="">Select approfile_is</option>';
    this.of_approfile.innerHTML = '<option value="">Select of_approfile</option>';
//console.log('');
    this.approfiles.forEach(file => {
//      console.log('fileId',file.name);
      const approfile_isOption = document.createElement('option');
      approfile_isOption.value = file.id;
      approfile_isOption.textContent = file.name;
      this.approfile_is.appendChild(approfile_isOption);

      const of_approfileOption = document.createElement('option');
      of_approfileOption.value = file.id;
      of_approfileOption.textContent = file.name;
      this.of_approfile.appendChild(of_approfileOption);
    });
  }




  
// has this relationship already been stored? Works (the table has a unique constraint so can't write to it)
async checkToAvoidDuplicates({approfile_is:approfile_is, of_approfile: of_approfile,relationship:relationship}){
      console.log('checkToAvoidDuplicates() CODE IGNORES the result - need edit')
      //nned add function to registry  //readRelationshipExists()
      const data = await executeIfPermitted(appState.query.userId, 'readRelationshipExists', {
        approfile_is:approfile_is,  //uuid
        of_approfile: of_approfile, //uuid
        relationship:relationship //name text   
      });
  
if(data) {console.log('Relationship duplicate:', data);
this.showError('This relationship is already in the system');}//
//if(!data)return 0;// its okay to go ahead because not already in there
return  data;
//if(step==1 || step==2) return step //previous assignment abandoned or completed, make a decision      
// assign again or move approfile_is back to step 3 of old assignment?      
//      
  }
  

  async handleRelate(e) {
    e.preventDefault();
    console.log('relateDialog.handleRelate(e)');
    this.assignBtn.disabled = true;
  
    const relationship_name = this.relationSelect.value;
    const approfile_is_id = this.approfile_is.value;
    const of_approfile_id = this.of_approfile.value;
  
    if (!relationship_name || !approfile_is_id || !of_approfile_id) {
    //  this.showError('All 3 needed');
      return;
    }
  
    try {
      const existing = await this.checkToAvoidDuplicates({
        approfile_is: approfile_is_id,
        of_approfile: of_approfile_id,
        relationship: relationship_name
      });
  
      if (existing && existing.length > 0) {
        this.assignBtn.textContent = 'Duplicate. This relationship already known. Select new';
       //this.showError('This relationship already exists.');
        return;
      }
  
      const newRelationship = await executeIfPermitted(appState.query.userId, 'writeApprofileRelation', {
        approfile_is: approfile_is_id,
        of_approfile: of_approfile_id,
        relationship: relationship_name
      });
  
      this.assignBtn.textContent = 'Related! Select others or close';
      this.showSuccess('Relationship created successfully.');
    } catch (error) {
      console.log(error.message);
      this.showError('Using show error: ' + error.message);
    } finally {
      this.assignBtn.disabled = true;
    }
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
}

export {RelateDialog};