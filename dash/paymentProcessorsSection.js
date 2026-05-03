//  ./dash/moneyManagementSection.js
console.log('moneyManagementSection.js loaded');
import { petitionBreadcrumbs } from'../ui/breadcrumb.js';

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<!-- money Management section -->
<div class="bg-green-100 rounded-lg shadow p-6" data-section="money-management" data-destination="new-panel">
  <h2 class="text-lg font-semibold mb-2">Memberships, subscriptions & donation Management</h2>
  <div class="text-sm text-gray-500 mb-4"> <p>We do not recommend any specific service. We do not offer financial advice.</p>
  <p> You can choose any of these or any other payment processor. However only some of them have been integrated into the app.
Integration means being able to make some use of the information within the app. Without integration you would use the website of the payment processor. </p>
The listed links are for Merchant of Record providers. They say they handle sales taxes and act as the actual seller of your subcriptions or memberships
  </div>

<div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="stats-cards">

  <!-- money -->
  
      <!-- Return -->
  <div class="bg-gray-200 border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-300 flex flex-col justify-center items-center text-center"  data-action="payment-processors-section">
    <h3 class="text-sm font-bold text-gray-700"">◀️ CLOSE PAYMENT PROCESSORS</h3>    
    <p class="text-xs text-blue-600">Return the section to its previous contents.</p>
  </div>
  


<!-- Whop Card -->
<div class="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
     data-action="whop-connect" 
     data-processor="whop">
  <div class="flex items-center mb-2">
    <img 
      src="/assets/logos/whop.png" 
      alt="Whop" 
      class="h-10 w-auto mr-2"
    />
    <!-- class="text-sm font-medium text-purple-700">Whop<-->
  </div>
  <p class="text-xs text-purple-600 mb-2">Merchant of Record. They create a shop like system </p>
  <p class="text-xs text-gray-500 mb-3">Marketplace + payments. Possible source of new members. Affiliate system</p>
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
    <img 
      src="/assets/logos/lemonsqueezy.png" 
      alt="Lemon Squeezy" 
      class="h-10 w-auto mr-2"
    />
    <!-- class="text-sm font-medium text-yellow-700">Lemon Squeezy<-->
  </div>
  <p class="text-xs text-yellow-600 mb-2"></p>
  <p class="text-xs text-gray-500 mb-3">Merchant of Record. Handles global taxes. Simple setup.</p>
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
    <img 
      src="/assets/logos/polar.png" 
      alt="Polar" 
      class="h-10 w-auto mr-2"
    />
    <!-- class="text-sm font-medium text-green-700">Polar<-->
  </div>
  <p class="text-xs text-green-600 mb-2">Merchant of Record</p>
  <p class="text-xs text-gray-500 mb-3">Open-source. Can self-host. Built for developers.</p>
  <a href="https://polar.sh/" 
     target="_blank" 
     rel="noopener noreferrer"
     class="inline-block text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition">
    Learn More →
  </a>
</div>

<!-- Stripe Card -->
<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
     data-action="stripe-connect" 
     data-processor="stripe">
  <div class="flex items-center mb-2">
    <img 
      src="/assets/logos/stripe.png" 
      alt="Stripe" 
      class="h-10 w-auto mr-2"
    />
    <!-- class="text-sm font-medium text-blue-700">Stripe<-->
  </div>
  <p class="text-xs text-blue-600 mb-2">Well known. This is their Merchant of Record version.</p>
  <p class="text-xs text-gray-500 mb-3">The basic stripe is an industry standard, but it leaves you responisble for sales taxes. The link is to their managed tax version</p>
  <a href="https://support.stripe.com/questions/managed-payments-pricing" 
     target="_blank" 
     rel="noopener noreferrer"
     class="inline-block text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition">
    Learn more →
  </a>
</div>


<!-- BTCPay Card -->
<div class="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
     data-action="btcpay-connect" 
     data-processor="btcpay">
  <div class="flex items-center mb-2">
    <img 
      src="/assets/logos/btcpay.png" 
      alt="BTCPay Server" 
      class="h-10 w-auto mr-2"
    />
    <!-- class="text-sm font-medium text-orange-700">BTCPay Server<-->
  </div>
  <p class="text-xs text-orange-600 mb-2"> Handles Crypto. Not a Merchant of Record.</p>
  <p class="text-xs text-gray-500 mb-3">Self-hosted. No account freezes. Bitcoin + Lightning support.</p>
  <a href="https://btcpayserver.org/" 
     target="_blank" 
     rel="noopener noreferrer"
     class="inline-block text-xs bg-orange-600 text-white px-3 py-1.5 rounded hover:bg-orange-700 transition">
    Learn More →
  </a>
</div>

<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
     data-action="patreon-connect" 
     data-processor="patreon">
  <div class="flex items-center mb-2">
    <img 
      src="/assets/logos/patreon.png" 
      alt="Patreon" 
      class="h-10 w-auto mr-2"
    />
  </div>
  <p class="text-xs text-blue-700 mb-2">Merchant of Record. Memberships and tiered fan support.</p>
  <p class="text-xs text-gray-500 mb-3">Popular social platform for creators. Includes community tools and gated content.</p>
  <a href="https://www.patreon.com" 
     target="_blank" 
     rel="noopener noreferrer"
     class="inline-block text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition">
    Learn More →
  </a>
</div>

<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
     data-action="subscribestar-connect" 
     data-processor="subscribestar">
  <div class="flex items-center mb-2">
    <img 
      src="/assets/logos/subscribestar.png" 
      alt="SubscribeStar" 
      class="h-10 w-auto mr-2"
    />
  </div>
  <p class="text-xs text-yellow-700 mb-2">Merchant of Record Membership platform for creators</p>
  <p class="text-xs text-gray-500 mb-3">Alternative subscription model with simple tiered support structures.</p>
  <a href="https://www.subscribestar.com" 
     target="_blank" 
     rel="noopener noreferrer"
     class="inline-block text-xs bg-yellow-600 text-white px-3 py-1.5 rounded hover:bg-yellow-700 transition">
    Learn More →
  </a>
</div>

<div class="bg-yellow-50 border border-yellow-100 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
     data-action="buymeacoffee-connect" 
     data-processor="buymeacoffee">
  <div class="flex items-center mb-2">
    <img 
      src="/assets/logos/buymeacoffee.png" 
      alt="Buy Me a Coffee" 
      class="h-10 w-auto mr-2"
    />
  </div>
  <p class="text-xs text-yellow-800 mb-2">Merchant of Record.Donations and memberships.</p>
  <p class="text-xs text-gray-500 mb-3">Minimalist setup. Perfect for ad-hoc support without complex tiers.</p>
  <a href="https://www.buymeacoffee.com" 
     target="_blank" 
     rel="noopener noreferrer"
     class="inline-block text-xs bg-yellow-500 text-black font-medium px-3 py-1.5 rounded hover:bg-yellow-600 transition">
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

//loadWhopCheckout();

     //? query.petitioner : 'unknown';
    console.log('Petition:', petition);
    // panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}- ${petition.Destination}</p>`;}
   // panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
  }

/*
function loadWhopCheckout(options = {}) {
  const {
    containerId = "whop-checkout",
    planId = "plan_fPED05pHu2vRp",
    returnUrl = window.location.href,
    theme = "dark",
    onComplete = null,
    // Product info defaults — customize these
    productName = "Move Mountains",
    productDescription = "Join a free community that teaches you how to create your own organization — nonprofits, community groups, movements, and more.",
    price = "Free",
    includes = [
      "Community Chat — connect with other aspiring founders",
      "Updates & Guides — step-by-step frameworks and resources"
    ]
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`[Whop] Container #${containerId} not found`);
    return;
  }

  // Build the info card + embed wrapper
  const isDark = theme === "dark";
  const bg = isDark ? "#1a1a2e" : "#ffffff";
  const cardBg = isDark ? "#16213e" : "#f8f9fa";
  const text = isDark ? "#e0e0e0" : "#1a1a2e";
  const textMuted = isDark ? "#a0a0b8" : "#6c757d";
  const accent = isDark ? "#4fc3f7" : "#0d6efd";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const checkColor = isDark ? "#66bb6a" : "#198754";

  const includesHTML = includes
    .map(
      (item) =>
        `<li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;">
          <span style="color:${checkColor};font-size:16px;line-height:1.4;flex-shrink:0;">✓</span>
          <span style="line-height:1.4;">${item}</span>
        </li>`
    )
    .join("");

  container.innerHTML = `
    <div style="max-width:420px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${text};">
      <div style="background:${cardBg};border:1px solid ${border};border-radius:12px;padding:24px;margin-bottom:16px;">
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;">${productName}</h2>
        <p style="margin:0 0 16px;font-size:14px;color:${textMuted};line-height:1.5;">${productDescription}</p>
        <div style="display:inline-block;background:${accent};color:#fff;font-size:13px;font-weight:600;padding:4px 12px;border-radius:20px;margin-bottom:16px;">${price}</div>
        <div style="border-top:1px solid ${border};padding-top:14px;margin-top:4px;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:${textMuted};">What's included</p>
          <ul style="list-style:none;margin:0;padding:0;font-size:14px;color:${text};">
            ${includesHTML}
          </ul>
        </div>
      </div>
      <div id="${containerId}-embed"></div>
    </div>
  `;

  // Set up the Whop embed inside the inner div
  const embedDiv = document.getElementById(`${containerId}-embed`);
  embedDiv.setAttribute("data-whop-checkout-plan", planId);
  embedDiv.setAttribute("data-whop-checkout-return-url", returnUrl);
  embedDiv.setAttribute("data-whop-checkout-theme", theme);
  if (onComplete) {
    embedDiv.setAttribute("data-whop-checkout-on-complete", onComplete);
  }

  // Inject the loader script once
  if (!document.querySelector('script[src*="js.whop.com"]')) {
    const script = document.createElement("script");
    script.src = "https://js.whop.com/static/checkout/loader.js";
    script.async = true;
    document.body.appendChild(script);
  } else {
    // If script already loaded, re-trigger by dispatching
    window.dispatchEvent(new Event("whop-checkout-reload"));
  }
}
*/



  /* very basic email inout + buy button No info
function loadWhopCheckout(options = {}) {
  const {
    containerId = "whop-checkout",
    planId = "plan_fPED05pHu2vRp",
    returnUrl = "",
    theme = "dark",
    onComplete = null,
  } = options;

  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Whop Checkout: element #${containerId} not found`);
    return;
  }

  // Set data attributes on the container
  container.setAttribute("data-whop-checkout-plan-id", planId);
  if (returnUrl) container.setAttribute("data-whop-checkout-return-url", returnUrl);
  if (theme) container.setAttribute("data-whop-checkout-theme", theme);

  // Register onComplete callback if provided
  if (typeof onComplete === "function") {
    const cbName = `__whopCheckoutComplete_${containerId}`;
    window[cbName] = onComplete;
    container.setAttribute("data-whop-checkout-on-complete", cbName);
  }

  // Inject the loader script if not already present
  if (!document.querySelector('script[src*="js.whop.com/static/checkout/loader.js"]')) {
    const script = document.createElement("script");
    script.src = "https://js.whop.com/static/checkout/loader.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}
*/



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

























