import { createSupabaseClient } from '../db/supabase.js';

const supabase = createSupabaseClient();

let authorViewType = 'all';

document.querySelectorAll('[data-toggle="authors"]').forEach((radio) => {
  radio.addEventListener('change', (e) => {
    authorViewType = e.target.value;
    renderAuthors();
  });
});

async function renderAuthors() {
  const title = document.querySelectorAll('[data-title="authors"]');
  const list = document.querySelectorAll('[data-toggle="author-list"]');

  list.innerHTML = '<p>Loading...</p>';

  let data;
  if (authorViewType === 'unique') {
    const res = await supabase.from('authors').select('*'); //there is no 'authors' table. Is there a view?
    data = res.data || [];
    title.textContent = `Authors (${data.length})`;
  } else {
    const res = await supabase.from('author_entries').select('*'); //this results in wrong number of 23
    data = res.data || [];
    title.textContent = `All Authored Tasks (${data.length})`;
  }

  list.innerHTML = data.map((item) => `
    <div class="p-2 border rounded">
      <div class="font-medium">${item.name || item.task_name || 'Unnamed'}</div>
      <div class="text-sm text-muted-foreground">ID: ${item.id}</div>
    </div>
  `).join('');
}

// Initial render
renderAuthors();
