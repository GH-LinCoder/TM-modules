import { executeIfPermitted } from "../../registry/executeIfPermitted";

// work/appprofiles/myRole.js
console.log('myRole.js loaded');

function getTemplateHTML() {
  console.log('getTemplateHTML()');
  return `
    <div class="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
      <h2 class="text-2xl font-bold text-gray-900 tracking-tight">The plans of our organisation</h2>
      <button data-action="my-role" class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100" aria-label="Close">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
}

function parseAndRenderDescription(rawText) {
  if (!rawText) return '<div class="text-gray-500 italic p-4">No description provided.</div>';

  // Split plain text by blank lines into distinct paragraphs
  const paragraphs = rawText
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  if (!paragraphs.length) return '';

  const blocksHtml = paragraphs.map((text, index) => {
    // Detect quotes or mottoes dynamically
    const hasQuote = /["']([^"']+)["']/.test(text);

    if (index === 0) {
      // First paragraph rendered as lead/hero block
      return `
        <div class="aim-block opacity-0 translate-y-4 transition-all duration-500 ease-out border-l-4 border-indigo-600 bg-indigo-50/50 p-4 rounded-r-xl text-lg font-semibold text-gray-900 leading-relaxed shadow-sm">
          ${text}
        </div>
      `;
    } else if (hasQuote) {
      // Paragraphs containing quotes rendered as callout cards
      return `
        <blockquote class="aim-block opacity-0 translate-y-4 transition-all duration-500 ease-out bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-800 italic shadow-sm relative overflow-hidden">
          <div class="absolute top-0 left-0 w-1.5 h-full bg-slate-400"></div>
          ${text}
        </blockquote>
      `;
    } else {
      // Regular body text blocks
      return `
        <div class="aim-block opacity-0 translate-y-4 transition-all duration-500 ease-out bg-white border border-gray-100 rounded-xl p-5 text-base text-gray-700 leading-relaxed shadow-sm">
          ${text}
        </div>
      `;
    }
  }).join('');

  return `<div class="space-y-4 my-4">${blocksHtml}</div>`;
}

function observeAnimations(panel) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-4');
          entry.target.classList.add('opacity-100', 'translate-y-0');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  panel.querySelectorAll('.aim-block').forEach((el) => observer.observe(el));
}
//ada3685a-7f9d-4cfd-b96f-8272e12e468e //aims
//fab5776c-d7e9-4d2a-b52e-85b19ba9ae53 //plans
//      //myRole - there is no appro for this 14:51 Sept 15
//7fb63f35-b4a0-4e4b-9a51-b3d93b124288  // myRole newly created  22


async function readAppro(panel) {
  //const aimsApproId = 'fab5776c-d7e9-4d2a-b52e-85b19ba9ae53';
  panel.innerHTML = '<div class="p-4 text-gray-600 flex items-center gap-2"><span class="animate-spin">⏳</span> Loading...</div>';
  
  let aimsAppro;
  
  try {
    aimsAppro = await executeIfPermitted(null, 'readApprofileById', { approfileId: '7fb63f35-b4a0-4e4b-9a51-b3d93b124288' });
  } catch (error) {
    console.error('Failed to load aims:', error);
    panel.innerHTML = '<div class="text-red-500 text-center py-8">Failed to load aims.</div>';
    return;
  }
  
  console.log('aimsAppro', aimsAppro);


const description = `<p>The inital role of a new user is to determine what you want to do.</p><p>Deciding what you want to do is by working through your initial assigned tasks and answering questions in surveys. 
</p>
<p>
The answers chosen in surveys change what groups you join or what tasks are assigned to you.  
</p>
<p>
The contents of this 'My role' module will change as you move through tasks and surveys.
</p>
`;

  const formattedDescription = parseAndRenderDescription(description);

  panel.innerHTML = `
    <div class="p-6 max-w-3xl mx-auto">
      ${getTemplateHTML()}
      ${formattedDescription}
      <div class="mt-6 rounded-xl p-4 bg-gray-50 border border-gray-200 text-xs text-gray-500 italic leading-normal">
        If you were using the app to create and manage your own organisation, you would edit this aim by editing the appro that stores this description: "Aims of the Organisation" with id: ada3685a-7f9d-4cfd-b96f-8272e12e468e
      </div>
    </div>
  `;

  // Trigger animations once DOM nodes are rendered
  observeAnimations(panel);
}



export function render(panel, petition = {}) {
  console.log('plans Render(', panel, petition, ')');
  readAppro(panel);
}