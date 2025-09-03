async function loadModule(action) {
  const moduleMap = {
    'open-create-task-dialogue': 'createTaskForm',
    // future mappings go here
  };

  const moduleName = moduleMap[action];
  if (!moduleName) {
    console.warn(`No module mapped for action: ${action}`);
    return;
  }

  try {
    const module = await import(`./dialogs/${moduleName}.js`);
    const container = getDisplayArea(); // your existing panel container
    const context = appState.query || {}; // or getQuery() if you wrap it

    // Optionally close existing panel with same stubName
    closePanelIfOpen(moduleName);

    // Render the module
    module.render(container, context);

    // Track panel if needed
    panelsOnDisplay.push({ stubName: moduleName, panel: container, query: context });

    // Update layout
    updatePanelLayout();
  } catch (err) {
    console.error(`Error loading module "${moduleName}":`, err);
    container.innerHTML = `<div class="text-red-700 p-4">Error loading module</div>`;
    updatePanelLayout();
  }
}


/*
changes to listener
*/

container.addEventListener('click', async (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;
  const moduleLoader = pageRegistry[action];

  if (!moduleLoader) {
    console.warn('Unknown action:', action);
    return;
  }

  const module = await moduleLoader();
  module.render(getDisplayArea(), appState.query); // or context
});


/*
REGISTRY   () =>  means only load when needed.
*/

const pageRegistry = {
  'create-task-dialogue': () => import('./forms/createTaskForm.js'),
  // other pages...
};





