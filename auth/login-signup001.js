//  ./work/dash/memberDash.js
console.log('memberDash.js loaded');

//import 

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<body class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <div class="w-full max-w-md bg-blue-100 rounded-lg shadow-md p-8">
    <h1 class="text-2xl font-bold text-center text-gray-900 mb-6">Create Account</h1>
    <div id="signupForm" class="auth-form">
    <form id="signupForm" class="space-y-4">
      <!-- signup User Name -->
      <div>
        <label for="signup-userName" class="block text-sm font-medium text-gray-700 mb-1">User name</label>
        <input 
          type="text" 
          id="signup-userName" 
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Johaness Von Doe"
          required
        />
      </div>

      <!-- signup Email -->
      <div>
        <label for="signup-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input 
          type="email" 
          id="signup-email" 
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
          required
        />
      </div>

      <!-- signup Password -->
      <div>
        <label for="signup-password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input 
          type="password" 
          id="signup-password" 
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
          minlength="6"
          required
        />
        <p class="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
      </div>

      <!-- Confirm Password -->
      <div>
        <label for="signup-confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input 
          type="password" 
          id="signup-confirmPassword" 
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
          required
        />
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        id="signupBtn"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        Sign Up
      </button>
    </form>

    <!-- Success Message (hidden by default) -->
    <div id="signup-successMessage" class="hidden mt-4 p-3 bg-green-100 text-green-800 rounded text-sm text-center">
      Account created! Redirecting...
    </div>

    <!-- Error Message -->
    <div id="signup-errorMessage" class="hidden mt-4 p-3 bg-red-100 text-red-800 rounded text-sm"></div>

    <!-- Link to Sign In -->
    <p class="mt-6 text-center text-sm text-gray-600">
      Already have an account? 
<button id ="showLoginForm">Login/out</button>
    </p>
  </div>
</div>
<!-------------------------------------------        --------------------------------------->

<body class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div id="loginForm" class="auth-form hidden">
<div class="w-full max-w-md bg-green-100 rounded-lg shadow-md p-8">
    <h1 class="text-2xl font-bold text-center text-gray-900 mb-6">Log in to existing Account</h1>

    <form id="loginForm" class="space-y-4">
      <!-- login User Name -->
      <div>
        <label for="login-userName" class="block text-sm font-medium text-gray-700 mb-1">Enter your user name</label>
        <input 
          type="text" 
          id="login-userName" 
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Johaness Von Doe"
          required
        />
      </div>

      <!-- login Email -->
      <div>
        <label for="login-email" class="block text-sm font-medium text-gray-700 mb-1">or enter Email</label>
        <input 
          type="email" 
          id="login-email" 
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
          required
        />
      </div>

      <!-- login Password -->
      <div>
        <label for="login-password" class="block text-sm font-medium text-gray-700 mb-1">Password required</label>
        <input 
          type="password" 
          id="login-password" 
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••"
          minlength="6"
          required
        />
        <p class="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
      </div>


      <!-- Submit Button -->
      <button 
        type="submit" 
        id="loginBtn"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        (enter username OR email) plus password
      </button>
    </form>

    <!-- Success Message (hidden by default) -->
    <div id="login-successMessage" class="hidden mt-4 p-3 bg-green-100 text-green-800 rounded text-sm text-center">
      Redirecting...
    </div>

    <!-- Error Message -->
    <div id="login-errorMessage" class="hidden mt-4 p-3 bg-red-100 text-red-800 rounded text-sm"></div>

    <!-- Link to Sign In -->
    <!--p class="mt-6 text-center text-sm text-gray-600">
      Don't have an account? 
<button class="nav-btn" data-page="login-signup" data-action="login-signup">Sign-up for account</button>
    </p-->
  


      <!-- Link to password change -->
    <p class="mt-6 text-center text-sm text-red-600">
      Can't remember password?

    <form id="forgot-password-form">
  <label for="password-email" class="text-center text-sm text-red-600">Enter email and click to renew password:</label>
  <input type="email" id="password-email" name="password-email" placeholder="Enter email then click" required <input 
          type="email" 
          id="password-email" 
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-500">
<button  type="submit"  class="w-full bg-red-300 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-md transition-colors" data-action="password-change">Enter email then click to change password</button>  
 </form>
      

    </p>
  </div>

  </div>

`}



function showAuthForm(formName) {
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.add('hidden');
  });
  document.getElementById(`${formName}Form`).classList.remove('hidden');
}


/*

ERROR: onclick showLoginForm is not defined  ??

When you return to it, focus first on:
1. **Unique element IDs**
2. **Form visibility toggle**
3. **Isolated error/success messaging**

<!-- Signup -->
<input id="signup-email" ...>
<!-- Login -->
<input id="login-email" ...>
<!-- Reset -->
<input id="reset-email" ...>

<div id="signup-error" class="hidden ..."></div>
<div id="login-error" class="hidden ..."></div>

Wrap each form in a container with a unique ID and class:
```html
<div id="signupForm" class="auth-form">
  <!-- signup fields -->
</div>
<div id="loginForm" class="auth-form hidden">
  <!-- login fields -->
</div>
<div id="resetForm" class="auth-form hidden">
  <!-- reset fields -->
</div>

Instead of one huge `render()` function, split logic:



*/
function showLoginForm(){
  console.log('showLoginForm()');

}

function initSignupForm() { /* ... */ }
function initLoginForm() { /* ... */ }
function initResetForm() { /* ... */ }

export function renderNEW(panel, petition = {}) {
  panel.innerHTML = getTemplateHTML();
  initSignupForm();
  initLoginForm();
  initResetForm();
  showAuthForm('login'); // default
}




export function render(panel, petition = {}) {
    console.log('memberDash Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();

     //? query.petitioner : 'unknown';
    console.log('Petition:', petition);
    panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}</p>`;

//petitioner

// is passed when the adminListeners() function calls appState.setQuery({callerContext: action});
//it has to be called prior to passing it in the query{} object when we call this module
//in adminListeners.js, when we call appState.setQuery(), we need to have added petitioner: petition
//then we can access it here in the render() function
//we can also add a default value of 'unknown' if it is not passed
//so we can see where we are when we open the a new page

//the call here isn't from adminListeners it is from the menu button in the dashboard
//so we need to also assign petitioner: {Module:'dashboard', Section:'menu', Action:'howTo'} when we call this module from the menu button
//we can do this in the dashboardListeners.js file
//we can also add a default value of 'unknown' if it is not passed







  // Handle sign-up form
  signupForm = document.getElementById('signupForm')
  
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const signup_userName = signupForm.getElementById('signup-userName').value.trim();
    const signup_email = signupForm.getElementById('signup-email').value.trim();
    const signup_password = signupForm.getElementById('signup-password').value;
    const signup_confirmPassword = signupForm.getElementById('signup-confirmPassword').value;
    const signupBtn = signupForm.getElementById('signupBtn');
    //const loginBtn = document.getElementById('loginBtn');
    const signup_errorMessage = signupForm.getElementById('signup-errorMessage');
    const signup_successMessage = signupForm.getElementById('signup-successMessage');

    // Reset messages
    signup_errorMessage.classList.add('hidden');
    signup_successMessage.classList.add('hidden');

    // Validate
    if (signup_password !== signup_confirmPassword) {
      signup_errorMessage.textContent = 'Passwords do not match';
      signup_errorMessage.classList.remove('hidden');
      return;
    }

    if (signup_password.length < 6) {
      signup_errorMessage.textContent = 'Password must be at least 6 characters';
      signup_errorMessage.classList.remove('hidden');
      return;
    }

    // Disable button
    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating account...';

    try {
      const { data, error } = await supabase.auth.signUp({
        signup_email,
        signup_password,
        options: {
          data: {
            full_name: userName,
            avatar_url: null
          }
        }
      });

      if (error) {
        signup_errorMessage.textContent = error.message;
        signup_errorMessage.classList.remove('hidden');
      } else {
        signup_successMessage.classList.remove('hidden');
        // Redirect after 1.5s
        setTimeout(() => {
          window.location.href = 'adminDash.html';
        }, 1500);
      }
    } catch (err) {
      signup_errorMessage.textContent = 'An unexpected error occurred';
      signup_errorMessage.classList.remove('hidden');
    } finally {
      signupBtn.disabled = false;
      signupBtn.textContent = 'Sign Up';
    }
  });


  // Handle login form

  const loginForm = document.getElementById('loginForm');
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const login_userName = loginForm.getElementById('login-userName').value.trim(); // can't use this?
    const login_email = loginForm.getElementById('login-email').value.trim();
    const login_password = loginForm.getElementById('login-password').value;
    
    const loginBtn = loginForm.getElementById('loginBtn');
    const login_errorMessage = loginForm.getElementById('login-errorMessage');
    const login_successMessage = loginForm.getElementById('login-successMessage');

    // Reset messages
    login_errorMessage.classList.add('hidden');
    login_successMessage.classList.add('hidden');


    if (login_password.length < 6) {
      login_errorMessage.textContent = 'Password must be at least 6 characters';
      login_errorMessage.classList.remove('hidden');
      return;
    }

    // Disable button
    loginBtn.disabled = true;
    loginBtn.textContent = 'Checking account...';
    handleLogin(login_email,login_password)
  
  })



async function handleLogin(email,password){
try{
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
});
}catch (error) {
  login_errorMessage = "Password or email not recognised";
  login_errorMessage.classList.remove('hidden');
} finally {
  loginBtn.disabled = false;
  loginBtn.textContent = 'Login';
  login_successMessage = "Logged in";
  login_successMessage.classList.remove('hidden');
}
}

async function handleSignOut(){
try{
    const { error } = await supabase.auth.signOut();  
  }catch (error) {
  console.log("error", error);
   }
}

async function handleNewPassword(){



}


}

