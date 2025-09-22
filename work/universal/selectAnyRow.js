// work/universal/selectAnyRow.js
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';
import { showToast } from '../../ui/showToast.js';
import { appState } from '../../state/appState.js';
import { TABLE_SCHEMAS } from '../../utils/tableSchema.js';
import { getDisplayLabel } from '../../utils/displayHelpers.js';
//import { registry } from '../../registry/registryWorkActions.js';

console.log('selectAnyRow.js loaded');

export function render(panel, query = {}) {
  console.log('selectAnyRow.render()');
  const dialog = new UniversalRowSelector();
  dialog.render(panel, query);
}

class UniversalRowSelector {
  constructor() {
    this.tables = Object.keys(TABLE_SCHEMAS);
    this.selectedTable = null;
    this.rows = [];
  }

  render(panel, query = {}) {
    panel.innerHTML = this.getTemplateHTML();
    this.init(panel);
  }

  init(panel) {
    this.panel = panel;
    this.dialog = panel.querySelector('[data-component="row-selector"]');
    this.tableSelect = panel.querySelector('[data-input="table"]');
    this.rowSelect = panel.querySelector('[data-input="row"]');
    this.asSelect = panel.querySelector('[data-input="as"]');
    this.rememberBtn = panel.querySelector('[data-action="remember"]');
    this.feedback = panel.querySelector('[data-display="feedback"]');

    // Event listeners
    this.dialog.querySelectorAll('[data-action="close"]').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    this.tableSelect.addEventListener('change', (e) => this.onTableChange(e));
    this.rowSelect.addEventListener('change', () => this.updateRememberButton());
    this.asSelect.addEventListener('change', () => this.updateRememberButton());
    this.rememberBtn.addEventListener('click', (e) => this.handleRemember(e));

    // Populate table dropdown
    this.populateTableDropdown();
  }

  populateTableDropdown() {
    this.tableSelect.innerHTML = '<option value="">Select a Table...</option>';
    this.tables.forEach(tableName => {
      const option = document.createElement('option');
      option.value = tableName;
      option.textContent = TABLE_SCHEMAS[tableName].label;
      this.tableSelect.appendChild(option);
    });
  }

  async onTableChange(e) {
    const tableName = e.target.value;
    if (!tableName) {
      this.rowSelect.innerHTML = '<option value="">Select a Row...</option>';
      this.rowSelect.disabled = true;
      this.asSelect.value = '';
      this.rememberBtn.disabled = true;
      return;
    }
  
    this.selectedTable = tableName;
    this.rowSelect.disabled = true;
    this.rowSelect.innerHTML = '<option value="">Loading rows...</option>';
    this.rememberBtn.disabled = true;
  
    try {
      // ✅ Construct expected action name: e.g., 'readAppProfiles'
      const readFunction = `read${tableName.charAt(0).toUpperCase() + tableName.slice(1)}`;
  console.log('readFunction', readFunction);
      let rows;
      
      try {
        // ✅ First, try the table-specific action
        rows = await executeIfPermitted(
          appState.query.userId, 
          readFunction, 
          {}
        );
      } catch (specificError) {
        console.warn(`Table-specific read failed (${readFunction}), falling back to generic:`, specificError.message);
        
        // ✅ Fallback to generic read
        rows = await executeIfPermitted(
          appState.query.userId, 
          'readGenericTable', 
          { tableName }
        );
      }
  
      this.rows = rows || [];
      this.populateRowDropdown();
      
      // Set default "as" value
      const defaultAs = TABLE_SCHEMAS[tableName]?.defaultAs || 'custom';
      const asOption = Array.from(this.asSelect.options).find(opt => opt.value === defaultAs);
      if (asOption) {
        this.asSelect.value = defaultAs;
      } else {
        this.asSelect.value = '';
      }
  
    } catch (error) {
      console.error('Error loading rows:', error);
      showToast(`Failed to load ${tableName}: ${error.message}`, 'error');
      this.rowSelect.innerHTML = '<option value="">Error loading rows</option>';
    }
  }

// Inside UniversalRowSelector class
populateRowDropdown() {
    this.rowSelect.innerHTML = '<option value="">Select a Row...</option>';
    this.rowSelect.disabled = false;
  
    const schema = TABLE_SCHEMAS[this.selectedTable];
    
    this.rows.forEach(row => {
      const option = document.createElement('option');
      option.value = row[schema.idField];

      console.log(`Row from ${this.selectedTable}:`, row);
      
      // Use intelligent display label
      let display = getDisplayLabel(row, schema, this.selectedTable);
      option.textContent = display || `[${row[schema.idField]}]`;
      option.dataset.json = JSON.stringify(row); // Store full row data
      this.rowSelect.appendChild(option);
    });
  
    this.updateRememberButton();
  }

  updateRememberButton() {
    const hasRow = this.rowSelect.value !== '';
    const hasAs = this.asSelect.value !== '';
    this.rememberBtn.disabled = !(hasRow && hasAs);
    this.rememberBtn.textContent = hasRow && hasAs ? 'Remember Selection' : 'Select Row & "As"';
  }

  handleRemember(e) {
    e.preventDefault();
    if (this.rememberBtn.disabled) return;

    const selectedOption = this.rowSelect.options[this.rowSelect.selectedIndex];
    const rowId = this.rowSelect.value;
    const asValue = this.asSelect.value;
    const fullRow = JSON.parse(selectedOption.dataset.json);

    // Build clipboard item
    const clipboardItem = {
      entity: {
        id: rowId,
        name: selectedOption.textContent,
        type: this.selectedTable,
        data: fullRow // Store full row for later use
      },
      as: asValue,
      meta: {
        timestamp: Date.now(),
        source: 'universal-row-selector',
        table: this.selectedTable,
        id: `clipboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    };

    // Add to clipboard
    if (!appState.clipboard) appState.clipboard = [];
    appState.clipboard.push(clipboardItem);

    // Emit event (if you have listeners)
    if (document) {
      document.dispatchEvent(new CustomEvent('clipboard:item-added', { detail: clipboardItem }));
    }

    // Feedback
    this.rememberBtn.textContent = '✓ Remembered!';
    this.feedback.innerHTML += `
      <div class="p-2 bg-green-50 border border-green-200 rounded">
        <div class="font-medium">Remembered: ${selectedOption.textContent}</div>
        <div class="text-sm">As: <strong>${asValue}</strong> | Table: ${this.selectedTable}</div>
      </div>
    `;
console.log('appState.clipboard:',appState.clipboard);
    showToast(`Remembered "${selectedOption.textContent}" as ${asValue}`, 'success');

    // Reset after 1.5s
    setTimeout(() => {
      this.rememberBtn.textContent = 'Remember Selection';
    }, 1500);
  }

  close() {
    if (this.panel && this.panel.parentElement) {
      this.panel.parentElement.removeChild(this.panel);
    }
  }

  getTemplateHTML() {
    return `
      <!--div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"-->
        <div data-component="row-selector" class="bg-white rounded-lg shadow-xl w-full max-w-2xl">
          <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold">Select Any Row to Remember</h3>
            <button data-action="close" class="text-gray-500 hover:text-gray-700" aria-label="Close">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">1. Select Table</label>
              <select data-input="table" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                <option value="">Select a Table...</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">2. Select Row</label>
              <select data-input="row" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" disabled>
                <option value="">Select a Table First...</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">3. Remember As...</label>
              <select data-input="as" class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500">
                <option value="">Select classification...</option>
                <option value="student">Student</option>
                <option value="manager">Manager</option>
                <option value="task">Task</option>
                <option value="assignment">Assignment</option>
                <option value="none">none</option>
                <option value="step">step</option>
                <option value="taxon">taxon</option>
                <option value="howTo">how to</option>
                <option value="category">category</option>
              
                <option value="custom">Custom...</option>
              </select>
            </div>
            <div class="pt-2">
              <button 
                data-action="remember" 
                class="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                disabled
              >
                Select Row & "As"
              </button>
            </div>
            <div class="pt-4">
              <div class="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                <p>📌 This is a temporary selection tool. Select any row from any table.</p>
                <p>🧠 You’ll be asked how to interpret it (“as”).</p>
                <p>💾 It will be stored in your semantic clipboard for use across the app.</p>
              </div>
            </div>
            <div data-display="feedback" class="pt-4">
              <!-- Feedback will appear here -->
            </div>
          </div>
        </div>
      <!--/div-->
    `;
  }
}