// ../work/manager/displayManagedSurveys.js
console.log('../work/manager/displayManagedSurveys.js loaded');

export async function render(panel) {
    console.log('displayManagedSurveys.js render()');
     const displayArea = document.querySelector(`[data-section="display-area"]`); 
displayArea.innerHTML = '<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading display-area...</div>';
}