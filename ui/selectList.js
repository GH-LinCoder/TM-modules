// ./ui/selectList.js

export function makeSelectList(selectEl, targetSize = 6) {
  console.log(`[makeSelectList] Called for #${selectEl?.id}, targetSize=${targetSize}`);
  
  if (!selectEl || selectEl.tagName !== 'SELECT') {
    console.warn('[makeSelectList] ❌ Invalid or missing element');
    return;
  }

  // Guard: skip re-attaching listeners, but ensure size is reset for next click
  if (selectEl.dataset.listReady === 'true') {
    console.log(`[makeSelectList] ⏭️ Already initialized for #${selectEl.id}. Resetting size to 0.`);
    selectEl.size = 0;
    return;
  }

  selectEl.dataset.listReady = 'true';
  console.log(`[makeSelectList] ✅ Initializing listeners for #${selectEl.id}`);

  const collapse = () => {
    if (document.contains(selectEl)) {
      selectEl.size = 0;
      selectEl.classList.remove('ring-2', 'ring-purple-500', 'border-purple-500');
      console.log(`[makeSelectList] 📉 Collapsed #${selectEl.id}, size set to 0`);
    }
  };

  selectEl.addEventListener('mousedown', (e) => {
    if (!document.contains(selectEl)) return;
    console.log(`[makeSelectList] 🖱️ mousedown on #${selectEl.id}, current size: ${selectEl.size}`);
    
    if (selectEl.size <= 1) {
      e.preventDefault();
  // Force browser to rebuild option list cache
  const currentVal = selectEl.value;
  selectEl.value = '';          // Clear triggers state reset
  selectEl.value = currentVal;  // Restore triggers full option re-sync

      selectEl.size = targetSize;
      selectEl.focus();
      selectEl.classList.add('ring-2', 'ring-purple-500', 'border-purple-500');
      console.log(`[makeSelectList] 📈 Expanded #${selectEl.id} to size ${targetSize}`);
    }
  });

  selectEl.addEventListener('change', collapse);
  selectEl.addEventListener('blur', collapse);
}