// ./work/auth/auth.js
import { createSupabaseClient } from '../db/supabase.js';
import { executeIfPermitted } from '../registry/executeIfPermitted.js';
import { showToast } from '../ui/showToast.js';
//NOTE: THERE IS A VERSION OF THIS INSIDE INDEX>HTML
//That may be the version you want to edit.


function getTemplateHTML() {
  return `
    <div id="authContainer" class="min-h-screen flex items-center justify-center bg-gray-50 px-4  transition: opacity 3.0s ease;">
      <div class="w-full max-w-md space-y-6">

      <!-- Change Password input form -->
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

            <label for="email">Email:</label>
            <input type="email" name='email' id="login-email" placeholder="Click to autoload" class="w-full p-2 border rounded" required autocomplete='email'/>

            <label for="current-password">Password:</label>
            <input type="password" name='current-password' id="login-password" placeholder="Click to autoload" class="w-full p-2 border rounded" autocomplete='current-password' aria-describedby="password-constraints"   required />
     
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
          <h2 class="text-xl font-bold text-center mb-4">Create free Account</h2>
          
          <form class="space-y-3">
          <label for="user-name">User name:</label>
            <input type="text" name="user-name" id="user-name" placeholder="Choose a unique name" class="w-full p-2 border rounded" required title="The user name will be visible to others. It will be checked to make sure it is unique">
            
            <label for="new-email">Email:</label>
            <input type="email" name="new-email" id="signup-email" placeholder="For confirmation link" class="w-full p-2 border rounded" required title="You will be sent an email to confirm the sign-up."/>

            <label for="new-password">Create a password:</label>
            <input type="password" name="new-password" id="signup-password" placeholder="Password (min 6 chars)" class="w-full p-2 border rounded" minlength="6" required title="You can change the password later by clicking 'forgotten' on the login form"/>
            <!--button id="toggle-password" type="button" aria-label="Show password as plain text. Warning: this will display your password on the screen.">👁️ Show password </button-->

            
            <button type="submit" id="signupBtn" class="w-full bg-blue-600 text-white py-2 rounded" title='There is no cost, no credit card.'>Sign Up</button>
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
            <label for="email">Email:</label>
            <input type="email" name='email' id="reset-email" placeholder="Enter the email you registered with" class="w-full p-2 border rounded" autocomplete='email' title='You will be sent a link' required />
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
    const userName = document.getElementById('user-name').value;    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const description = 'Applied to become authenticated user';
    
    const { data, error  } = await supabase.auth.signUp({
      email,
      password });
    if (error) {
      document.getElementById('signup-error').textContent = error.message;
      document.getElementById('signup-error').classList.remove('hidden');
    } else {
      document.getElementById('signup- please check your email').classList.remove('hidden');
      document.getElementById('signup-error').classList.add('hidden');
   await createAppros(userName, description, email, data.user.id);
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

// toggle password on sign-up form 

//const togglePasswordButton = document.querySelector("#toggle-password");
//const passwordInput = document.querySelector("#signup-password");
//togglePasswordButton.addEventListener("click", togglePassword(togglePasswordButton, passwordInput));
//document.getElementById('toggle-password').addEventListener('click',togglePassword(togglePasswordButton, passwordInput));
//the above cals the function and the display is always showing the password as text. It doesn't toggle.

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

// 
async function createAppros(userName, description, email, authUserId){
console.log('createAppros(', userName, email, authUserId,')');
if(!userName || !email || !authUserId) {console.log('Error'); return};
//registry func needs:     const {approName, approDescription, approEmail, authId} = payload;

try{ //to create an appro to represent the new user (even though not yet authenticated)
const newAppro = await executeIfPermitted('createApproFromNewAuthUser', {approName:userName, approDescription: description ,email:email, authUserId:authUserId}) // can't use the newUserId as not auth. Need to use a db function
console.log('created newppro:', newAppro);

relateNewAppro(newAppro); // relat the new appro to whatever categories seem reasonable. First is [a member] of [human]

} catch (error) { //console.log(error.message);
console.log('Failed to create appro: ' + error.message);
  showToast('Failed to create appro: ' + error.message, 'error');
    }


//assemble input data  userName, email, password
// collect data returned after sending email & password to auth
// if no error
//use userName + email +'Application to be authenticated' to create an appro & place data.id in auth_user_id column
// collect new appro id
// relate new appro_is [memeber] of [Humans]

}

async function relateNewAppro(newAppro){
console.log('relateNewAppro()', newAppro);
const humanAppro ='0a025b65-ea1a-419f-ac79-3bb57978486a';// this is the uuid for the category 'human' appro
try{//func needs  const { approfile_is, relationship, of_approfile, assigned_by_automation } = payload; assigned by is a uuid
const newRelation = await executeIfPermitted('autoRelateAppro', {approfile_is:newAppro, relationship:'a member', of_approfile:humanAppro, assigned_by_automation:null}) // can't use the newUserId as not auth. Need to use a db function
console.log('related:', newRelation);



} catch (error) { //console.log(error.message);
console.log('Failed to relate appro: ' + error.message);
  showToast('Failed to relate appro: ' + error.message, 'error');
    }

}

/*
function togglePassword(togglePasswordButton, passwordInput) {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePasswordButton.textContent = "Hide password";
    togglePasswordButton.setAttribute("aria-label", "Hide password.");
  } else {
    passwordInput.type = "password";
    togglePasswordButton.textContent = "👁️ Show password";
    togglePasswordButton.setAttribute(
      "aria-label",
      "Show password as plain text. " +
        "Warning: this will display your password on the screen."
    );
  }
}
*/






  // index handles the obtained token from trying to reset the password. As the db is going to send a link that redirects to index.html, the change will have to be handled there and not in the
  //current login-signup module. 
  //The request for a new password could be started here (although unlikely as to be here means having used the pasword to get here)
  //It is possible that someone could get into the app with a password manager, but have forgotten what the password is