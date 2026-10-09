// ./work/how/howTo.js
console.log('howTo.js loaded');
import { petitionBreadcrumbs } from '../../ui/breadcrumb.js';
import { appState } from '../../state/appState.js';
import { executeIfPermitted } from '../../registry/executeIfPermitted.js';  //added 12:49 Oct 7 2026

// Track the actively displayed help context and whether the user manually selected it
let activeHelpContext = null;
let isManualOverride = false;



// Basic XSS sanitization helper (Replace with DOMPurify.sanitize if you use it)
/*
function sanitizeHTML(str) { //added 12:49 Oct 7 2026
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str; // Strips all HTML tags for safety
  // If notes contain safe, pre-formatted HTML (like <p>, <ul>, <strong>), 
  // we should use a library like DOMPurify here instead of textContent.
  return div.innerHTML; 
} */


/**
 * Determines the default context when the module opens.
 * Finds the most recently opened panel that isn't the help module itself.
 */
function getDefaultContext(panelsOnDisplay) {
  if (!panelsOnDisplay || panelsOnDisplay.length === 0) return {};
  
  for (let i = panelsOnDisplay.length - 1; i >= 0; i--) {
    const panel = panelsOnDisplay[i];
    const query = panel.query || {};
    const action = query.Action || panel.panelName || 'Unknown';
    
    if (action !== 'howTo' && action !== 'howTo.html') {
      return {
        Module: query.Module || 'Unknown',
        Section: query.Section || 'Unknown',
        Action: action,
        Destination: query.Destination || panel.panelName || 'Unknown'
      };
    }
  }
  return {};
}

function getHelpContentHTML(petition) {
  if (!petition || !petition.Action) {
    return '<p class="text-gray-500 italic">No context selected.</p>';
  }
  
  return `
    <div class="bg-blue-50 p-5 rounded-lg border border-blue-200 transition-all duration-300">
      <h3 class="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Context Help: ${petition.Action}
      </h3>
      <ul class="space-y-2 text-sm text-gray-700 mb-4">
        <li><span class="font-medium text-gray-900 w-24 inline-block">Module:</span> ${petition.Module || 'Unknown'}</li>
        <li><span class="font-medium text-gray-900 w-24 inline-block">Section:</span> ${petition.Section || 'Unknown'}</li>
        <li><span class="font-medium text-gray-900 w-24 inline-block">Action:</span> ${petition.Action}</li>
        <li><span class="font-medium text-gray-900 w-24 inline-block">Location:</span> ${petition.Destination || 'Unknown'}</li>
      </ul>
      <div class="p-4 bg-white rounded border border-blue-100 text-sm text-gray-600 shadow-sm">
        <p class="font-medium text-gray-800 mb-1">How to use "${petition.Action}":</p>
        <div id = 'howTo-inject-here' class = "min-h-[3rem]"><em>(Placeholder: Specific, context-sensitive help content for "${petition.Action}" will be loaded here from the lookup table in the next development stage.)</em></div>
      </div>
    </div>
  `;
}

/**
 * Generates a single, unified list of cards for all open panels.
 */
function getContextSelectorHTML(panelsOnDisplay) {
  if (!panelsOnDisplay || panelsOnDisplay.length === 0) {
    return '<p class="text-gray-500 italic">No panels are currently open.</p>';
  }

  let cardsHTML = '';
  const seenActions = new Set(); // Track which actions we've already added

  for (let i = panelsOnDisplay.length - 1; i >= 0; i--) {
    const panel = panelsOnDisplay[i];
    const query = panel.query || {};
    const action = panel.panelName || query.Action || 'Unknown';
    
    // Skip if we've already added a card for this action
    if (seenActions.has(action)) continue;
    seenActions.add(action);
    
    const isActive = activeHelpContext && activeHelpContext.Action === action;

    const stateClasses = isActive
      ? 'ring-2 ring-blue-500 bg-blue-100 border-blue-300'
      : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-300';

    const icon = isActive ? '★' : '□';

    cardsHTML += `
      <button
        class="context-selector-btn ${stateClasses} text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 transition-all duration-200 flex items-center gap-2 shadow-sm cursor-pointer"
        data-module="${query.Module || 'Unknown'}"
        data-section="${query.Section || 'Unknown'}"
        data-card="${action}"
        data-destination="${query.Destination || panel.panelName || 'Unknown'}"
        aria-pressed="${isActive}"
      >
        <span class="${isActive ? 'text-blue-700' : 'text-gray-400'}">${icon}</span>
        <span>${action}</span>
      </button>
    `;
  }

  return `
    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 class="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
        Select Context for Help
      </h3>
      <div class="flex flex-wrap gap-2">
        ${cardsHTML}
      </div>
    </div>
  `;
}

/*
function updateHelpDisplay(panel, newContext) {
  const helpContainer = panel.querySelector('#help-content-display');
  if (helpContainer) {
    helpContainer.innerHTML = getHelpContentHTML(newContext);
  }
} */  //replaced 12:52 Oct 7 2026
 
async function updateHelpDisplay(panel, newContext) {
  const helpContainer = panel.querySelector('#help-content-display');
  if (!helpContainer) return;

  helpContainer.innerHTML = getHelpContentHTML(newContext);

  if (!newContext || !newContext.Action) return;

  const injectDiv = helpContainer.querySelector('#howTo-inject-here');
  if (!injectDiv) return;

  try {
    const userId = appState.query.userAuthId;
    const payload = { title: newContext.Action };
    
    const howToNotes = await executeIfPermitted(userId, 'fetchHowToNotes', payload);

    if (!howToNotes || howToNotes.length < 1) {
      injectDiv.textContent = `No specific help content is currently available for "${newContext.Action}".`;
      injectDiv.className = "text-gray-500 italic text-sm break-words";
      
    } else {
      const noteContent = howToNotes[0].content || 'No text content found.';
      
      // SECURE: textContent prevents ALL XSS. 
      // whitespace-pre-wrap preserves line breaks and spacing.
      // break-words forces long unbroken strings to wrap.
      injectDiv.textContent = noteContent;
      injectDiv.className = "text-sm text-gray-700 whitespace-pre-wrap break-words";

      if (howToNotes.length > 1) {
        const infoDiv = document.createElement('div');
        infoDiv.className = "mt-3 pt-3 border-t border-blue-100 flex items-start gap-2";
        infoDiv.innerHTML = `
          <svg class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p class="text-xs text-blue-700">
            There are <strong>${howToNotes.length}</strong> help notes available. Showing the primary one.
          </p>
        `;
        injectDiv.parentNode.appendChild(infoDiv);
      }
    }
  } catch (error) {
    console.error('❌ Error fetching how-to notes:', error);
    injectDiv.textContent = 'Failed to load help content.';
    injectDiv.className = "text-red-500 text-sm italic break-words";
  }
}

function renderContextSelector(panel, panelsOnDisplay) {
  const selectorContainer = panel.querySelector('#context-selector-display');
  if (selectorContainer) {
    selectorContainer.innerHTML = getContextSelectorHTML(panelsOnDisplay);
    attachContextListeners(panel);
  }
}

function attachContextListeners(panel) {
  const buttons = panel.querySelectorAll('.context-selector-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
     // e.preventDefault();
     // e.stopPropagation();
      
      isManualOverride = true; // User explicitly chose a context
      
      // Reset all buttons to inactive state
      buttons.forEach(b => {
        b.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-100', 'border-blue-300');
        b.classList.add('bg-white', 'hover:bg-gray-50', 'border', 'border-gray-200');
        b.setAttribute('aria-pressed', 'false');
        b.querySelector('span:first-child').classList.replace('text-blue-700', 'text-gray-400');
        b.querySelector('span:first-child').textContent = '□';
      });
      
      // Set clicked button to active state
      e.currentTarget.classList.remove('bg-white', 'hover:bg-gray-50', 'border-gray-200');
      e.currentTarget.classList.add('ring-2', 'ring-blue-500', 'bg-blue-100', 'border-blue-300');
      e.currentTarget.setAttribute('aria-pressed', 'true');
      e.currentTarget.querySelector('span:first-child').classList.replace('text-gray-400', 'text-blue-700');
      e.currentTarget.querySelector('span:first-child').textContent = '★';

      const newContext = {
        Module: e.currentTarget.dataset.module,
        Section: e.currentTarget.dataset.section,
        Action: e.currentTarget.dataset.card,
        Destination: e.currentTarget.dataset.destination
      };
      
      activeHelpContext = newContext;
      updateHelpDisplay(panel, newContext);
    });
  });
}

function renderTheHistory(panel) {
  const maxLines = appState.query?.maxHistoryLength || 6;
  const historyContainer = panel.querySelector('#history-display');
  if (!historyContainer) return;

  const history = appState.query.petitionHistory || [];
  let html = '<h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Petition history</h4><ul class="text-xs text-gray-600 space-y-1 font-mono">';
  
  for (let i = maxLines; i > 0; i--) {
    const item = history[i];
    if (!item) continue;
    html += `<li class="truncate">[${i}] ${item.Module || 'Unknown'} - ${item.Section || 'Unknown'} : <span class="text-blue-600">${item.Action}</span> in ${item.Destination || 'Unknown'}</li>`;
  }
  html += '</ul>';
  historyContainer.innerHTML = html;
}

function scheduleStateRead(panel) {
  setTimeout(() => {
    if (!panel.isConnected) return;

    const latestPanels = appState.panelsOnDisplay || [];

    renderTheHistory(panel);

    if (!isManualOverride) {
      const newContext = getDefaultContext(latestPanels);
      
      // Always update the context and display, not just when it changes
      activeHelpContext = newContext;
      updateHelpDisplay(panel, activeHelpContext);
    }

    // Always re-render the selector to update highlights
    renderContextSelector(panel, latestPanels);
  }, 100);
}
export function render(panel, petition = {}) {
  console.log('howTo render called with petition:', petition);
  console.log('panel element:', panel);
  console.log('panel.isConnected:', panel?.isConnected);
  
  isManualOverride = false;
  
  panel.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto border border-gray-100">
      <div class="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
        <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          How To Use
        </h2>
        <button data-section="howTo"  data-action="howTo" class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100" aria-label="Close Help">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div id="help-content-display" class="mb-6">
        <p class="text-gray-500 italic">Loading context...</p>
      </div>
      <div id="context-selector-display" class="mb-6">
        <div class="animate-pulse flex space-x-4">
          <div class="flex-1 space-y-4 py-1">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
      <details class="mb-6 group border border-gray-200 rounded-lg space-y-2">
        <summary class="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-2 p-3 bg-gray-50 rounded-t-lg hover:bg-gray-100 transition-colors">
          <svg class="w-4 h-4 transition-transform duration-200 group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          General Navigation Tips
        </summary>
        <div class="mb-3 bg-blue-50 p-3 rounded border border-blue-200 text-sm text-blue-700 space-y-2">    
         <p>Clicking top of screen menu - opens the item to right of dashboard on a large screen or just under the menu on small screens.</p>
         <p>clicking a card within the page [rectangles with words in them] opens the new item in the dashboard (scroll down or up if needed)</p>
         <p>The browser back button may return you to the login page.</p>
         <p>If it gets messy click [My Dash]</p>
        </div>
      </details>
      <div id="history-display" class="border-t border-gray-200 pt-4 text-sm"></div>
      <div class="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
        ${petitionBreadcrumbs(petition)}
      </div>
    </div>
  `;

  // CRITICAL: Immediately update the help display with the current context
  // This ensures the content is shown even if the panel gets recreated
  const initialPanels = appState.panelsOnDisplay || [];
  const initialContext = getDefaultContext(initialPanels);
  if (initialContext) {
    activeHelpContext = initialContext;
    updateHelpDisplay(panel, initialContext);
  }
  
  // Also immediately render the context selector
  renderContextSelector(panel, initialPanels);
  renderTheHistory(panel);

  scheduleStateRead(panel);

  if (panel._stateChangeListener) {
    window.removeEventListener('state-change', panel._stateChangeListener);
  }
  
  panel._stateChangeListener = () => {
    scheduleStateRead(panel);
  };
  
  window.addEventListener('state-change', panel._stateChangeListener);
}