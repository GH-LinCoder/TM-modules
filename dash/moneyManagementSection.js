//  ./dash/moneyManagementSection.js
console.log('moneyManagementSection.js loaded');
import { petitionBreadcrumbs } from'../ui/breadcrumb.js';

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<!-- money Management section -->
<div class="bg-green-100 rounded-lg shadow p-6" data-section="money-management-section" data-destination="money-management-section">
  <h2 class="text-lg font-semibold mb-2">Memberships, subscriptions & donation Management</h2>
  <div class="text-sm text-gray-500 mb-4"><p>We do not recommend any specific service. We do not offer financial advice.</p>
   
</div>

<div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="stats-cards">

  <!-- money -->
  

      <!-- Return -->
  <div class="bg-gray-200 border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-300 flex flex-col justify-center items-center text-center"  data-action="money-management-section">
    <h3 class="text-sm font-bold text-gray-700"">◀️ CLOSE MONEY MANAGEMENT</h3>    
    <p class="text-xs text-blue-600">Return the section to its previous contents.</p>
  </div>


<!-- Example payment plans Card -->
<div class="bg-green-100 border border-green-600 rounded-lg p-4" data-action="provider-mockups">
  <h3 class="text-sm font-medium text-blue-700 mb-1">💸 Try example working payment plans </h3>
  <p class="text-xs text-blue-600">These are working examples of what your payment system would resemble. 
  
</div>


<div class="bg-green-100 border border-blue-400 rounded-lg p-4" data-action="payment-processors-section" >
    <h2 class="text-sm font-medium text-blue-700 mb-1">🤔 💷 💵 💶 Some payment providers  </h2>
    
    <p class="text-xs text-blue-600">Click here to see the payment processors who act as Merchant of Record.</p>
  </div>


<!-- API Keys Card     1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣0️⃣-->
<div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="store-api-keys">
  <h3 class="text-sm font-medium text-gray-700 mb-1">Store API Keys - AFTER CHOOSING 3️⃣</h3>
  <p class="text-xs text-gray-600">Your chosen provider will supply you with two bits of code called 'keys'. You will need to copy and paste them into the app. These are encrypted and are stored in a special place in the database.</p>
</div>

<!-- Webhook URL Card -->
<div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="generate-webhook-url">
  <h3 class="text-sm font-medium text-gray-700 mb-1">Webhook URL - AFTER CHOOSING 4️⃣</h3>
  <p class="text-xs text-gray-600">Your provider needs to know a web address that is part of your organization's app. The app will generate that address which you then copy and paste into the website of your provider. It is usually in a section called 'webhook settings'. Usually you will be asked what kind of messages you want to receive about payments. Select: payment.succeeded, subscription.cancelled</p>
  <code class="block mt-2 text-xs bg-gray-100 p-2 rounded">After choosing your provider this will be activated</code>
  <button class="mt-2 text-xs bg-gray-600 text-white px-2 py-1 rounded" data-action="copy-webhook-url">Copy</button>
</div>

<!-- Product ID Card -->
<div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="store-product-id">
  <h3 class="text-sm font-medium text-gray-700 mb-1">Product/Price ID - AFTER CHOOSING 5️⃣</h3>
  <p class="text-xs text-gray-600">You will probably use the provider's website to name, price and describe the subscriptions or memberships or other payment plans. You need to copy the reference for that (often called a Product or Price ID) from your provider and past it into the admin form. Then the app knows what reference to send to your provider when someone clicks to pay.</p>
</div>

<!-- Success URL Card -->
<div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="success-url">
  <h3 class="text-sm font-medium text-gray-700 mb-1">Success URL- AFTER CHOOSING 6️⃣</h3>
  <p class="text-xs text-gray-600">When someone agrees to pay you they will be handled by the provider. After payment, the provider will arrange to display whatever webpage we tell it to display. The browser will load that page. Here is the page details that the provider needs to be able to do this. Copy this to your provider's "Redirect After Checkout" setting.</p>
  <code class="block mt-2 text-xs bg-gray-100 p-2 rounded">After choosing your provider this will be activated</code>
</div>

<!-- JS Snippet Card -->
<div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="js-snippet">
  <h3 class="text-sm font-medium text-gray-700 mb-1">Buy Button Code- AFTER CHOOSING 7️⃣</h3>
  <p class="text-xs text-gray-600">Your provider may run a system where they supply us with some code that is used to create the 'buy button' on our website. If they offer that method you copy the little piece of code from their website and paste it into here. Later you can paste this snippet into your survey or task to display a buy button.</p>
  <textarea class="mt-2 w-full text-xs bg-gray-100 p-2 rounded" rows="3" readonly>example of type of code [data-action="render-buy-button"]</textarea>
</div>



</div>
</div>
               ${petitionBreadcrumbs()} 
`}


export function render(panel, petition = {}) {
    console.log('taskManagement Render(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();

     //? query.petitioner : 'unknown';
    console.log('Petition:', petition);
    // panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}- ${petition.Destination}</p>`;}
   // panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
  }
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

























