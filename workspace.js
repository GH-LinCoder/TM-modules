// workspace.js
import { supabase } from '/lib/supabase.js';

export async function loadWidget(containerId, widgetUrl, requiredPermissions) {
  const user = await supabase.auth.getUser();
  const hasAccess = true; // Simplified — add real ABAC later

  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const response = await fetch(widgetUrl);
    const html = await response.text();
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p class="text-red-600">Failed to load widget</p>`;
  }
}