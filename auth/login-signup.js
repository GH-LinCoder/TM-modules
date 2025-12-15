// ./work/auth/auth.js
import { createSupabaseClient } from '../db/supabase.js';
import { showToast } from '../ui/showToast.js';

function getTemplateHTML() {
  return `
    <div id="authContainer" class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="w-full max-w-md space-y-6">
        <!-- Signup Form -->
        <div id="signupForm" class="auth-form bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-bold text-center mb-4">Create Account</h2>
          <div id="signup-error" class="text-red-500 text-sm hidden"></div>
          <div id="signup-success" class="text-green-500 text-sm hidden">Check your email to confirm!</div>
          <form class="space-y-3">
            <!--input type="text" id="full-name" placeholder="Full Name" class="w-full p-2 border rounded" required /-->
            <input type="email" id="signup-email" placeholder="Email" class="w-full p-2 border rounded" required />
            <input type="password" id="signup-password" placeholder="Password (min 6 chars)" class="w-full p-2 border rounded" minlength="6" required />
            <button type="submit" id="signupBtn" class="w-full bg-blue-600 text-white py-2 rounded">Sign Up</button>
          </form>
          <p class="text-center mt-4">
            <button id="showLogin" class="text-blue-600 hover:underline">Already have an account? Log in</button>
          </p>
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
    </div>
  `;
}

function showForm(formId) {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
  document.getElementById(formId).classList.remove('hidden');
}

export async function render(panel, query = {}) {
  panel.innerHTML = getTemplateHTML();
const supabase = createSupabaseClient();
  // Attach tab buttons
  document.getElementById('showLogin').onclick = () => showForm('loginForm');
  document.getElementById('showSignup').onclick = () => showForm('signupForm');
  document.getElementById('showReset').onclick = () => showForm('resetForm');
  document.getElementById('backToLogin').onclick = () => showForm('loginForm');

  // Signup
  document.getElementById('signupBtn').onclick = async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
  //  const fullName = document.getElementById('full-name').value;

    const { error } = await supabase.auth.signUp({
      email,
      password,
   //   options: { data: { full_name: fullName } }
    });

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
    } else {
      showToast('Login successful!', 'success');
      window.location.href = '/flexload.html'; // your app
    }
  };

  // Password reset
  document.getElementById('resetBtn').onclick = async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/flexload.html`
    });

    if (error) {
      document.getElementById('reset-error').textContent = error.message;
      document.getElementById('reset-error').classList.remove('hidden');
    } else {
      document.getElementById('reset-success').classList.remove('hidden');
    }
  };
}