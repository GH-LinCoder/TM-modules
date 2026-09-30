// ../work/manager/displayAllConnections.js
console.log('../work/manager/displayAllConnections.js');

export async function render(panel) {
    console.log('displayAllConnected.js render()');

 const displayArea = document.querySelector(`[data-section="display-area"]`); 
//  panel.innerHTML = '<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading...</div>';
displayArea.innerHTML = '<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading display-area...</div>';

}