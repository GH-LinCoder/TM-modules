import { appState } from '../state/appState.js';
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { showToast } from '../ui/showToast.js';
//import { petitionBreadcrumbs } from '../ui/breadcrumb.js';
import { getClipboardItems, onClipboardUpdate } from '../utils/clipboardUtils.js';
import { resolveSubject, detectContext, applyPresentationRules } from '../utils/contextSubjectHideModules.js';



export async function render(pane, query) {
    
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Try to read profile
  let profile;
  try {
    profile = await executeIfPermitted(user.id, 'readApprofileByUserId', {
      authUserId: user.id
    });
  } catch (err) {
    console.error('No profile found:', err.message);
    showToast('No appro means no relations. Please fill in your appro details. Choose a userName.');
  }

  // 2. If missing or name empty, prompt and create/update
  if (!profile || !profile.name) {
    const chosenName = prompt("Please enter a username:");
    if (chosenName) {
      profile = await executeIfPermitted(user.id, 'createOrUpdateApprofile', {
        authUserId: user.id,
        name: chosenName,
        email: user.email
      });
    }
  }

  // 3. Render into the card
  if (profile) {
    pane.querySelector('[data-user="initials"]').textContent =
      profile.name.split(/\s+/).map(w => w[0].toUpperCase()).join('-');
    pane.querySelector('[data-user="name"]').textContent = profile.name;
    pane.querySelector('[data-user="email"]').textContent = profile.email || user.email;
    pane.querySelector('[data-user="student-id"]').textContent = profile.id;
    pane.querySelector('[data-user="join-date"]').textContent =
      new Date(profile.created_at).toLocaleDateString();
    pane.querySelector('[data-user="last-login"]').textContent =
      new Date(user.last_sign_in_at).toLocaleString();
  }
}
