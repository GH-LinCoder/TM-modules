import { createSupabaseClient } from "./db/supabase.js";
import { loadAdminDashWithData } from './dash/loadAdminDashWithData.js';
import { setupAdminListeners } from './ui/adminListeners.js';
import { setupNavigationListeners } from "./ui/navListeners.js";

// === UTILITY: Get main display area ===
function getDisplayArea() {
  return document.querySelector('[data-panel="inject-here"]');
}

// === UTILITY: Resolve stub path ===
function getPathForPage(stubName) {
  // Current structure: all stubs in one folder
  return `htmlStubs/${stubName}`;
}

// === GLOBAL STATE ===
const panelsOnDisplay = [];
const supabase = createSupabaseClient();

// === QUERY OBJECT ===
const query = {
  userId: null,
  stubName: null,
  recordId: null,
  READ_request: false,
  INSERT_request: false,
  DELETE_request: false,
  UPDATE_request: false,
  callerContext: null,
  purpose: null,
  payload: {},
  response: null
};

// === DEV MODE: Load admin.html stub ===
query.stubName = 'admin.html';
query.READ_request = true;
query.userId = '06e0a6e6-c5b3-4b11-a9ec-3e1c1268f3df'; // MOCK but in db







// === APP INITIALIZATION ===
document.addEventListener('DOMContentLoaded', onAppLoad);

async function onAppLoad() {
  const displayArea = getDisplayArea();
  console.log('Initial displayArea:', displayArea);
  if (panelsOnDisplay.length === 0) {
    panelsOnDisplay[0] = query.stubName; //initially admin.html
    await renderPanel(query);
    await loadAdminDashWithData();
  }

  setupNavigationListeners();
  setupAdminListeners(displayArea);
}

// === PANEL RENDERING ===
async function renderPanel(query) {
  const stubName = query.stubName;
  const displayArea = getDisplayArea();
  const panel = document.createElement('div');
  panel.className = 'page-panel bg-amber-50 p-8';
  panel.dataset.pageName = stubName;

  const pageUrl = getPathForPage(stubName);

  try {
    const response = await fetch(pageUrl);
    if (!response.ok) throw new Error(`Failed to load ${stubName}`);

    console.log("Attempting to load:", stubName);
    console.log("Fetch response status:", response.status);
    


    const html = await response.text();
    panel.innerHTML = html;
    displayArea.appendChild(panel);

    panelsOnDisplay.push({ stubName, panel, query });

    if (typeof setupPage === 'function') {
      setupPage(query, panel);
    }

    resizePanels();
  } catch (err) {
    console.error(`Error loading ${stubName}:`, err);
    panel.innerHTML = `<div class="text-red-700 p-4">Error loading ${stubName}</div>`;
    displayArea.appendChild(panel);
  }
}

// === PANEL TOGGLE ===
function closePanel(stubName) {
  const entry = panelsOnDisplay.find(p => p.stubName === stubName);
  if (entry && entry.panel) {
    entry.panel.remove();
    panelsOnDisplay.splice(panelsOnDisplay.indexOf(entry), 1);
    resizePanels();
  }
}

// === PANEL RESIZING ===
function resizePanels() {
  const displayArea = getDisplayArea();
  const total = panelsOnDisplay.length || 1;
  const width = `${Math.floor(90 / total)}%`;

  Array.from(displayArea.children).forEach(panel => {
    panel.style.width = width;
  });
}

// === NAVIGATION HANDLING ===
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.nav-btn');
  if (!btn) return;

  const stubName = btn.dataset.page;
  const alreadyOpen = panelsOnDisplay.find(p => p.stubName === stubName);

  if (alreadyOpen) {
    closePanel(stubName);
  } else {
    query.stubName = stubName;
    query.callerContext = panelsOnDisplay[0]?.stubName || 'unknown';
    await renderPanel(query);
  }
});
