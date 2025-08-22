// reactToHowToButton.js
export async function reactToHowToButton() {
  const contentArea = document.getElementById('content');
  const rightPanel = contentArea.querySelector('.w-1/2');

  if (rightPanel) {
    const response = await fetch('/howTo.html');
    const html = await response.text();
    rightPanel.innerHTML = html;
  } else {
    const leftPanel = contentArea.querySelector(':first-child');
    if (leftPanel) {
      leftPanel.classList.replace('w-full', 'w-1/2');
      const newRight = document.createElement('div');
      newRight.className = 'w-1/2 p-6';
      newRight.innerHTML = await (await fetch('/howTo.html')).text();
      contentArea.appendChild(newRight);
    }
  }
}