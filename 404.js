//  ./work/dash/memberDash.js
console.log('memberDash.js loaded');

//import    NOT TESTED   This 404.js has not been tested.  (The 404.html functions)

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<body class="min-h-screen flex items-center justify-center bg-gray-100">
  <div class="text-center p-8">
    <h1 class="text-6xl font-bold text-gray-800 mb-4">Default page</h1>
    <p class="text-2xl text-gray-600 mb-6">Click the menu to select a page.</p>
    <p class="text-gray-500 mb-8" id="attempted-path">This default page shows if the app isn't told which page to begin with. Dev can set the initial page in flexmain.js. In production the initial page would be determined at app load by permissions. If that fails then this default page would display</p>
    
    <a 
      href="/" 
      class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
      id="home-link"
    >
      See splash screen / login
    </a>
  </div>

`}

export function render(panel, petition = {}) {
    console.log('memberDash Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();

     //? query.petitioner : 'unknown';
    console.log('Petition:', petition);
    panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}</p>`;

//petitioner

// is passed when the adminListeners() function calls appState.setQuery({callerContext: action});
//it has to be called prior to passing it in the query{} object when we call this module
//in adminListeners.js, when we call appState.setQuery(), we need to have added petitioner: petition
//then we can access it here in the render() function
//we can also add a default value of 'unknown' if it is not passed
//so we can see where we are when we open the a new page

//the call here isn't from adminListeners it is from the menu button in the dashboard
//so we need to also assign petitioner: {Module:'dashboard', Section:'menu', Action:'howTo'} when we call this module from the menu button
//we can do this in the dashboardListeners.js file
//we can also add a default value of 'unknown' if it is not passed


console.error('404 Error: User attempted to access non-existent route:', window.location.pathname);
    
// Display the attempted path
const pathElement = document.getElementById('attempted-path');
if (window.location.pathname !== '/404.html') {
  pathElement.textContent = `You tried to access: ${window.location.pathname}`;
}

// Add hover effect to home link
const homeLink = document.getElementById('home-link');
homeLink.addEventListener('mouseenter', () => {
  homeLink.style.transform = 'translateY(-2px)';
});

homeLink.addEventListener('mouseleave', () => {
  homeLink.style.transform = 'translateY(0)';
});

}