// utils/clipboardUtils.js
import { appState } from '../state/appState.js';

export function getClipboardItems({ as = null, type = null, sortBy = 'newest' } = {}) {
  if (!appState.clipboard) return [];
  
  let items = [...appState.clipboard];
  
  // Filter
  if (as) items = items.filter(item => item.as === as);
  if (type) items = items.filter(item => item.entity.type === type);
  
  // Sort
  if (sortBy === 'newest') {
    items.sort((a, b) => b.meta.timestamp - a.meta.timestamp);
  } else if (sortBy === 'oldest') {
    items.sort((a, b) => a.meta.timestamp - b.meta.timestamp);
  }
  
  return items;
}

export function onClipboardUpdate(callback) {
  document.addEventListener('clipboard:updated', (e) => {
    callback(e.detail.clipboard);
  });
}

export function getLastItem({ as = null, type = null } = {}) {
  const items = getClipboardItems({ as, type, sortBy: 'newest', limit: 1 });
  return items.length > 0 ? items[0] : null;
}