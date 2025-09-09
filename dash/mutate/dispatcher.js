//To be put where ??  Remeber that change of state triggers something flexmain 98
//  calls openClosePanelsByRule(payload.petitioner.Action);
// the below would have to be involved in openClosePanelByRule


//   currently using   handleCardClick(action, moduleName)



function handleDashboardClick(query) {
  const { section, action } = query;
  const mutation = MutateRegistry[section]?.[action];

  if (mutation) {
    mutateDashboardSection(section, mutation);
  } else {
    openClosePanelsByRule(stubName, fromButtonClick = false);// this needs to be as is
  }
}




// === OPEN/CLOSE PANELS BY RULE ===
export async function openClosePanelsByRule(stubName, fromButtonClick = false) {
console.log('openClosePanelsByRule(', stubName, 'fromButtonClick:', fromButtonClick,')');

if(fromButtonClick){document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));}

    // Check if this is a 2nd click for an already open page
    const isPageOpen = panelsOnDisplay.some(p => p.stubName === stubName);
    console.log('isPageOpen:', isPageOpen);

    // Special case: dashboards
    const isDashboard =stubName === 'adminDash.html' || stubName === 'memberDash.html'|| stubName === 'adminDash' || stubName === 'memberDash';
    console.log('isDashboard:', isDashboard);    

    // 2nd Click on open dashboard
    if (isDashboard && isPageOpen) {
      // Clicking on already open admin or member - close all other panels
      closeAllOtherPanels(stubName);  // next lines are using 'query' instead of the pass param 'stubName'  !!! <<<<<<
      await loadPageWithData(stubName.replace('.html','')); //this refreshes data on already open panel
    //  if(fromButtonClick) {btn.classList.add('active');}
    } else 
    
    // 1st Click to open a dashboard
    if (isDashboard && !isPageOpen) {
      // Switching between admin and member - replace current with new one
      closeAllPanels();
      await renderPanel({...appState.query.petitioner, 'Action': stubName});//puts the name of the desired module in petitioner   
      await loadPageWithData(appState.query.petitioner.Action.replace('.html','')); 
    //  if(fromButtonClick) {btn.classList.add('active');}
    } 
    
    // Clicked on other menu buttons 
    else if (!isDashboard) {

      // 2nd Click on an open page
      if (isPageOpen) {
        // If already open, close it
        console.log('Panel already open, closing it:', stubName);
        closePanel(stubName);
      } else 

      { // 1st Click for an ordinary page
        // Open new panel - this is to display a new side page that is not admin or member & not already open
        await renderPanel({...appState.query.petitioner, 'Action': stubName});
        await loadPageWithData(appState.query.petitioner.Action.replace('.html','')); 
       // where do we check and connect input forms to the database? Here or in loadPageWithData? 17:10 Sept 2 2025
      }

      // Always keep admin or member active when opening other panels
        const activePanel = panelsOnDisplay.find(p => 
        p.stubName === 'adminDash.html' || p.stubName === 'memberDash.html');
      
      if (activePanel) {
        const activeBtn = document.querySelector(`[data-page="${activePanel.stubName === 'adminDash.html' ? 'adminDash' : 'memberDash'}"]`);
        if (activeBtn) activeBtn.classList.add('active');
      }
    }
  }
// could move loadPageWithData outside the if/else as they all call it 17:05 Sept 2 2025


function handleDashboardClick(query) {
  const { section, action } = query;
  const mutation = MutateRegistry[section]?.[action];

  if (mutation) {
    mutateDashboardSection(section, mutation);
  } else {
    openClosePanelsByRule(stubName, fromButtonClick = false);// this needs to be as is
  }
}







/*
dashboardMutationRegistry[section] tries to access the object for the given section (e.g. 'task-&-member').

The ?. is the optional chaining operator — it checks if the left-hand side exists before trying to access the next level.

[action] then tries to access the mutation config for that specific action (e.g. 'member-management').

What the registry returns is the part of the object following  section.action {  which is the title for the section and the definitions of the cards}








  */
