// ./utils/escapeHTML.js   to remove the <  > & " ' to prevent the effect of html in a text being implemented"
export function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
   ;
}

// .replace(/"/g, '&quot;')
//    .replace(/'/g, '&#039;')