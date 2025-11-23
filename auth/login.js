//  ./work/dash/memberDash.js
console.log('memberDash.js loaded');

//import 

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<body class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <div class="w-full max-w-md bg-white rounded-lg shadow-md p-8">
    <h1 class="text-2xl font-bold text-center text-gray-900 mb-6">Log in to existing Account</h1>
    
    <form id="loginForm" class="space-y-4">
      <!-- User Name -->
      <div>
        <label for="userName" class="block text-sm font-medium text-gray-700 mb-1">Enter your user name</label>
        <input 
          type="text" 
          id="userName" 
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Johaness Von Doe"
          required
        />
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">or enter Email</label>
        <input 
          type="email" 
          id="email" 
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="you@example.com"
          required
        />
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password required</label>
        <input 
          type="password" 
          id="password" 
          class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="••••••••"
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
    <div id="successMessage" class="hidden mt-4 p-3 bg-green-100 text-green-800 rounded text-sm text-center">
      Redirecting...
    </div>

    <!-- Error Message -->
    <div id="errorMessage" class="hidden mt-4 p-3 bg-red-100 text-red-800 rounded text-sm"></div>

    <!-- Link to Sign In -->
    <p class="mt-6 text-center text-sm text-gray-600">
      Don't have an account? 
<button class="nav-btn" data-page="login-signup" data-action="login-signup">Sign-up for account</button>
    </p>
  </div>


      <!-- Link to password change -->
    <p class="mt-6 text-center text-sm text-red-100">
      Can't remember password? 
<button class="nav-btn" data-page="password-change" data-action="password-change">Change password</button>
    </p>
  </div>



`}

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
  document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const signupBtn = document.getElementById('signupBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Reset messages
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');

    // Validate
    if (password !== confirmPassword) {
      errorMessage.textContent = 'Passwords do not match';
      errorMessage.classList.remove('hidden');
      return;
    }

    if (password.length < 6) {
      errorMessage.textContent = 'Password must be at least 6 characters';
      errorMessage.classList.remove('hidden');
      return;
    }

    // Disable button
    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating account...';

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            avatar_url: null
          }
        }
      });

      if (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
      } else {
        successMessage.classList.remove('hidden');
        // Redirect after 1.5s
        setTimeout(() => {
          window.location.href = 'adminDash.html';
        }, 1500);
      }
    } catch (err) {
      errorMessage.textContent = 'An unexpected error occurred';
      errorMessage.classList.remove('hidden');
    } finally {
      signupBtn.disabled = false;
      signupBtn.textContent = 'Sign Up';
    }
  });

}