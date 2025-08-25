// ./db/auth.js

// Global auth state
let user = null;
let session = null;
let loading = true;
const authListeners = [];

// Initialize auth system
async function initAuth() {
  // Get initial session
  const {  { session: initialSession } } = await supabase.auth.getSession();
  session = initialSession;
  user = initialSession?.user || null;
  loading = false;

  // Listen for auth changes
  const {  { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
    session = newSession;
    user = newSession?.user || null;
    
    // Notify all listeners
    authListeners.forEach(callback => {
      if (typeof callback === 'function') {
        callback({ user, session, loading: false });
      }
    });
  });

  return () => subscription.unsubscribe();
}

// Subscribe to auth changes
function onAuthStateChange(callback) {
  if (typeof callback === 'function') {
    authListeners.push(callback);
    
    // Immediately call with current state
    callback({ user, session, loading });
    
    // Return unsubscribe function
    return () => {
      const index = authListeners.indexOf(callback);
      if (index > -1) {
        authListeners.splice(index, 1);
      }
    };
  }
}

// Sign out function
async function signOut() {
  await supabase.auth.signOut();
  // State will be updated by the auth listener
}

// Get current auth state
function getAuthState() {
  return { user, session, loading };
}

// Check if user is authenticated
function isAuthenticated() {
  return !loading && !!user;
}

// Initialize auth when script loads
document.addEventListener('DOMContentLoaded', () => {
  initAuth().catch(console.error);
});

// Export functions for use in other modules
window.auth = {
  onAuthStateChange,
  signOut,
  getAuthState,
  isAuthenticated
};