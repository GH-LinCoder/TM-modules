// ./work/auth/auth.js
import { createSupabaseClient } from '../db/supabase.js';
import { showToast } from '../ui/showToast.js';
//NOTE: THERE IS A VERSION OF THIS INSIDE INDEX>HTML
//That may be the version you want to edit.


function getTemplateHTML() {
  return `
    <div id="authContainer" class="min-h-screen flex items-center justify-center bg-gray-50 px-4  transition: opacity 3.0s ease;">
      <div class="w-full max-w-md space-y-6">

      <!-- update Password input form -->
    <div id="newPasswordForm" class="auth-form  bg-white p-6 rounded-lg shadow hidden border border-slate-200">
      <h2 class="text-xl font-bold text-center mb-4">Set New Password</h2>
      <form id="update-password-form" class="space-y-3">
        <input type="password" id="new-password" placeholder="New password" class="w-full p-2 border rounded" minlength="6" required />
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded">Update Password</button>
      </form>
    
      <div id="update-password-error" class="text-red-500 text-sm hidden">
      </div>
      <div id="update-password-success" class="text-green-500 text-sm hidden">Password updated successfully!
      </div>
    </div>

      <!-- Login Form -->
        <div id="loginForm" class="auth-form bg-white p-6 rounded-lg shadow hidden">
          <h2 class="text-xl font-bold text-center mb-4">Log In</h2>
          <div id="login-error" class="text-red-500 text-sm hidden"></div>
          <form class="space-y-3">
            <input type="email" id="login-email" placeholder="Email" class="w-full p-2 border rounded" required />
            <input type="password" id="login-password" placeholder="Password" class="w-full p-2 border rounded" required />
            <button type="submit" id="loginBtn" class="w-full bg-green-600 text-white py-2 rounded">Log In</button>
          </form>
          <p class="text-center mt-2">
            <button id="showReset" class="text-sm text-blue-600 hover:underline">Forgot password?</button>
          </p>
          <p class="text-center mt-2">
            <button id="showSignup" class="text-sm text-gray-600 hover:underline">Create account</button>
          </p>
        </div>


      <!-- Signup Form -->
    <div id="signupForm" class="auth-form bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-bold text-center mb-4">Create Account</h2>
          <form class="space-y-3">
            <!--input type="text" id="full-name" placeholder="Full Name" class="w-full p-2 border rounded" required /-->
            <input type="email" id="signup-email" placeholder="Email" class="w-full p-2 border rounded" required />
            <input type="password" id="signup-password" placeholder="Password (min 6 chars)" class="w-full p-2 border rounded" minlength="6" required />
            <button type="submit" id="signupBtn" class="w-full bg-blue-600 text-white py-2 rounded">Sign Up</button>
          </form>
          <p class="text-center mt-4">
            <button id="showLogin" class="text-blue-600 hover:underline">Already have an account? Log in</button>
          </p>
          <p class="text-center mt-2">
          <button id="logoutBtn" class="text-sm text-green-600 hover:underline">Log out</button>
          </p>

        <div id="signup-error" class="text-red-500 text-sm hidden">
        </div>
          <div id="signup-success" class="text-green-500 text-sm hidden">Check your email to confirm!
          </div>
    </div>



      <!-- Reset Form -->
        <div id="resetForm" class="auth-form bg-white p-6 rounded-lg shadow hidden">
          <h2 class="text-xl font-bold text-center mb-4">Reset Password</h2>
          <div id="reset-error" class="text-red-500 text-sm hidden"></div>
          <div id="reset-success" class="text-green-500 text-sm hidden">Check your email for reset link!</div>
          <form class="space-y-3">
            <input type="email" id="reset-email" placeholder="Email" class="w-full p-2 border rounded" required />
            <button type="submit" id="resetBtn" class="w-full bg-purple-600 text-white py-2 rounded">Send Reset Link</button>
          </form>
          <p class="text-center mt-4">
            <button id="backToLogin" class="text-blue-600 hover:underline">Back to login</button>
          </p>
        </div>

      </div>
    </div><!-- eo auth container -->
  `;
}


function showForm(formId) {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
  document.getElementById(formId).classList.remove('hidden');
}


export async function render(panel, query = {}) {
  panel.innerHTML = getTemplateHTML();
const supabase = createSupabaseClient();
  

  // Signup
  document.getElementById('signupBtn').onclick = async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    const { error } = await supabase.auth.signUp({
      email,
      password });
    if (error) {
      document.getElementById('signup-error').textContent = error.message;
      document.getElementById('signup-error').classList.remove('hidden');
    } else {
      document.getElementById('signup-success').classList.remove('hidden');
      document.getElementById('signup-error').classList.add('hidden');
    }
  };

  // Login
  document.getElementById('loginBtn').onclick = async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      document.getElementById('login-error').textContent = error.message;
      document.getElementById('login-error').classList.remove('hidden');
    } else {  //  showToast('Login successful!', 'success');
      window.location.href = '/flexload.html'; // the app
    }
  };

// Logout

document.getElementById('logoutBtn').addEventListener('click', async (e) => { 
  e.preventDefault(); 
  const { error } = await supabase.auth.signOut(); 
  if (error) { console.error('Logout error:', error.message); 
    alert('Failed to log out. Please try again.'); 
  } 
    else { const app = document.getElementById('authContainer'); 
      app.style.opacity = '0'; // trigger fade 
      setTimeout(() => { 
    window.location.href = '/index.html'; 
  }); 

}
});



  // Password reset request
  document.getElementById('resetBtn').onclick = async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/index.html`
    });
    if (error) {
      document.getElementById('reset-error').textContent = error.message;
      document.getElementById('reset-error').classList.remove('hidden');
    } else {
      document.getElementById('reset-success').classList.remove('hidden');
    }
  };

// nav buttons
  document.getElementById('showLogin').onclick = () => showForm('loginForm');
  document.getElementById('showSignup').onclick = () => showForm('signupForm');
  document.getElementById('showReset').onclick = () => showForm('resetForm');
  document.getElementById('backToLogin').onclick = () => showForm('loginForm');
//document.getElementById('newPasswordForm').onclick = () => showForm('newPasswordForm');



//copied from index.html . a listener for the update password  21:57 dec 17
  document.addEventListener('submit', async (e) => {
    if (e.target.id === 'update-password-form') {
      e.preventDefault();
      const newPassword = document.getElementById('new-password')?.value;
      if (!newPassword) return;

      const { error } = await supabase.auth.updateUser({ password: newPassword });

      const errorEl = document.getElementById('update-password-error');
      const successEl = document.getElementById('update-password-success');

      if (error) {
        if (errorEl) {
          errorEl.textContent = error.message;
          errorEl.classList.remove('hidden');
        }
      } else {
        if (successEl) successEl.classList.remove('hidden');
        setTimeout(() => window.location.href = '/flexload.html', 1500);
      }
    }
  });
}
  // index handles the obtained token from trying to reset the password. As the db is going to send a link that redirects to index.html, the change will have to be handled there and not in the
  //current login-signup module. 
  //The request for a new password could be started here (although unlikely as to be here means having used the pasword to get here)
  //It is possible that someone could get into the app with a password manager, but have forgotten what the password is