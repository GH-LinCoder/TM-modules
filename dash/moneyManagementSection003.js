//  ./dash/moneyManagementSection.js
console.log('moneyManagementSection.js loaded');
import { petitionBreadcrumbs } from'../ui/breadcrumb.js';

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<!-- money Management section -->
<div class="bg-green-100 rounded-lg shadow p-6" data-section="money-management" data-destination="new-panel">
  <h2 class="text-lg font-semibold mb-2">Members, subscriptions & donation Management</h2>
  <p class="text-sm text-gray-500 mb-4">Click to carryout the action, it opens in a new panel to the right </p>
<div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="stats-cards">

  <!-- money -->
  
      <!-- Return -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="money-management-section">
    <h3 class="text-sm font-medium text-blue-700 mb-1">◀️ Return to previous section</h3>
    
    <p class="text-xs text-blue-600">Click here as a back button to return the section to its previous contents.</p>
  </div>
  
<!-- Stripe Card -->
<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
     data-action="stripe-connect" 
     data-processor="stripe">
  <div class="flex items-center mb-2">
    <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white rounded border border-gray-200 p-2 overflow-visible">
      <img 
        src="/assets/logos/Stripe.png" 
        alt="Stripe" 
        style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain;"
      />
    </div>
    <h3 class="text-sm font-medium text-blue-700 ml-2">Stripe</h3>
  </div>
  <p class="text-xs text-blue-600 mb-2">Best for: Full control, subscriptions, global payments</p>
  <p class="text-xs text-gray-500 mb-3">Industry standard. Supabase-native integration. Handles VAT/taxes automatically.</p>
  <a href="https://dashboard.stripe.com/register" 
     target="_blank" 
     rel="noopener noreferrer"
     class="inline-block text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition">
    Create Account →
  </a>
</div>

<!-- Whop Card -->
<div class="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
     data-action="whop-connect" 
     data-processor="whop">
  <div class="flex items-center mb-2">
    <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded border border-gray-200 p-1">
      <img 
        src="/assets/logos/Whop.png" 
        alt="Whop" 
        class="w-full h-full object-contain"
      />
    </div>
    <h3 class="text-sm font-medium text-purple-700 ml-2">Whop</h3>
  </div>
  <p class="text-xs text-purple-600 mb-2">Best for: Quick setup, digital goods, communities</p>
  <p class="text-xs text-gray-500 mb-3">Marketplace + payments. Built-in discovery. Affiliate system included.</p>
  <a href="https://whop.com/sell/" 
     target="_blank" 
     rel="noopener noreferrer"
     class="inline-block text-xs bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 transition">
    Create Account →
  </a>
</div>

<!-- Lemon Squeezy Card -->
<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
     data-action="lemonsqueezy-connect" 
     data-processor="lemonsqueezy">
  <div class="flex items-center mb-2">
    <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded border border-gray-200 p-1">
      <img 
        src="/assets/logos/LemonSqueezy.png" 
        alt="Lemon Squeezy" 
        class="w-full h-full object-contain"
      />
    </div>
    <h3 class="text-sm font-medium text-yellow-700 ml-2">Lemon Squeezy</h3>
  </div>
  <p class="text-xs text-yellow-600 mb-2">Best for: Simple products, affiliates, software</p>
  <p class="text-xs text-gray-500 mb-3">Merchant of Record. Handles global taxes. Very simple setup.</p>
  <a href="https://app.lemonsqueezy.com/register" 
     target="_blank" 
     rel="noopener noreferrer"
     class="inline-block text-xs bg-yellow-600 text-white px-3 py-1.5 rounded hover:bg-yellow-700 transition">
    Create Account →
  </a>
</div>

<!-- Polar Card -->
<div class="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
     data-action="polar-connect" 
     data-processor="polar">
  <div class="flex items-center mb-2">
    <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded border border-gray-200 p-1">
      <img 
        src="/assets/logos/Polar.png" 
        alt="Polar" 
        class="w-full h-full object-contain"
      />
    </div>
    <h3 class="text-sm font-medium text-green-700 ml-2">Polar</h3>
  </div>
  <p class="text-xs text-green-600 mb-2">Best for: Open source, sovereignty, software sales</p>
  <p class="text-xs text-gray-500 mb-3">Open-source merchant. Can self-host. Built for developers.</p>
  <a href="https://polar.sh/" 
     target="_blank" 
     rel="noopener noreferrer"
     class="inline-block text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition">
    Learn More →
  </a>
</div>

<!-- BTCPay Card -->
<div class="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
     data-action="btcpay-connect" 
     data-processor="BTCpay">
  <div class="flex items-center mb-2">
    <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded border border-gray-200 p-1">
      <img 
        src="/assets/logos/BTCPAY.png" 
        alt="BTCPay Server" 
        class="w-full h-full object-contain"
      />
    </div>
    <h3 class="text-sm font-medium text-orange-700 ml-2">BTCPay Server</h3>
  </div>
  <p class="text-xs text-orange-600 mb-2">Best for: Crypto, maximum sovereignty, no third-party</p>
  <p class="text-xs text-gray-500 mb-3">Self-hosted. No account freezes. Bitcoin + Lightning support.</p>
  <a href="https://btcpayserver.org/" 
     target="_blank" 
     rel="noopener noreferrer"
     class="inline-block text-xs bg-orange-600 text-white px-3 py-1.5 rounded hover:bg-orange-700 transition">
    Learn More →
  </a>
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

// is passed when the buildPetitionListener() function calls appState.setQuery({callerContext: action});
//it has to be called prior to passing it in the query{} object when we call this module
//in buildPetitionListener.js, when we call appState.setQuery(), we need to have added petitioner: petition
//then we can access it here in the render() function
//we can also add a default value of 'unknown' if it is not passed
//so we can see where we are when we open the a new page

//the call here isn't from buildPetitionListener it is from the menu button in the dashboard
//so we need to also assign petitioner: {Module:'dashboard', Section:'menu', Action:'howTo'} when we call this module from the menu button
//we can do this in the dashboardListeners.js file
//we can also add a default value of 'unknown' if it is not passed
