<!--The intial entry point to the app is organise.html. The following is GH-copilots attempt to find every thing the follows from that landing page, every direct link and every lazy-load module that can be called. It ignores external links to payment processors. It does not list what can be linked from the Task external urls.

It has attempted to indicate all live reachable files and separately files that are not reachable which may be legacy or temporary rollback files created when making major edits to a working file (these are suffixed 001, 002 etc)

Excluded:

dist
node_modules
xOld
.gitignore
.env
vite.config.js -->

<!------------------organise.html-->

Petition flow from the real entry point
organise.html
-> loads flexmain.js
-> flexmain.js imports:
- menuListeners.js
- adminListeners.js
- windowEventListener.js
- registryLoadModule.js
- appState.js
-> menuListeners.js handles nav clicks, sets:
appState.setPetitioner({ Section:'menu', Action:'myDash', Destination:'new-panel' })
-> windowEventListener.js listens for state-change
-> openClosePanelsByRule() in flexmain.js
-> renderPanel() in flexmain.js
-> registry[Action] in registryLoadModule.js
-> lazy import e.g. () => import('../work/dash/myDash.js')
-> module exports render(panel, query) and renders into the selected panel/section

<!--The key interpretation is in: -->

adminListeners.js: readPetition(e) builds {Module, Section, Action, Destination}
appState.js: setPetitioner() stores the petition and emits the state-change
windowEventListener.js: calls openClosePanelsByRule(payload.petitioner.Action)
flexmain.js: resolves the action via registry[...] and calls module.render(panel, query)
Complete non-excluded workspace inventory