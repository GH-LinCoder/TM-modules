//  ./dash/moneyManagementSection.js
console.log('moneyManagementSection.js loaded');
import { petitionBreadcrumbs } from'../ui/breadcrumb.js';
import { resolveSubject } from'../utils/contextSubjectHideModules.js';

function getTemplateHTML() { console.log('getTemplateHTML()');
  return `
<!-- money Management section -->
<div class="bg-green-100 rounded-lg shadow p-6" data-section="provider-mockups" data-destination="provider-mockups">
  <h2 class="text-lg font-semibold mb-2">Memberships, subscriptions & donation Management</h2>
  <div class="text-sm text-gray-500 mb-4">
  <p>We do not recommend any specific service. We do not offer financial advice.</p>
  <p> You can choose any payment provider and create whatever plans suit your organization.</p>
  <p>We have set-up the following provider stores as examples of how systems work.
  These examples are connected to payment processors and have example membership plans set-up. They are both for an organization called 'Moving Mountains'. </p>
  <p> You may have to just click the button or enter your email and then click. You will see what those providers would do when someone buys your subscription or membership. 
   </p>
   <p> Within our app if we have 'integrated' the provider's system with our system we can track who has paid what and the details would show up in the display relations module in the 'Pay' tab. 
   If we have not yet integrated the provider, you can still track the sales through the provider's control panel webpage.
   </p>

<p> These are for our very own 'Moving Mountains' organization. 
  The memberships are free because that makes it possible to demonstrate how payment plans work.
  <i>We don't show prices so that you are not asked for a credit card</i></p>
</div>

<div class="grid md:grid-cols-3 lg:grid-cols-4 gap-6" id="stats-cards">

  <!-- money -->
  
      <!-- Return -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4" data-action="provider-mockups">
    <h3 class="text-sm font-medium text-blue-700 mb-1">◀️ Return to previous section</h3>
    
    <p class="text-xs text-blue-600">Click here as a back button to return the section to its previous contents.</p>
  </div>
  



<!--    1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣0️⃣-->




<!-- Lemon Squeezy working sales system -->
<div class="bg-gray-50 border border-gray-200 rounded-lg p-4" >
  <h3 class="text-sm font-medium text-gray-700 mb-1">Lemon Squeezy</h3>
  <p class="text-xs text-gray-600">This is a working examples of what your payment system would resemble</p>
  <p> <i>The card design is under our apps control <p>
<div id="lemon-checkout"></div>
  </div>

<!-- Whop working sales system -->
<div class="bg-gray-50 border border-gray-200 rounded-lg p-4" >
  <h3 class="text-sm font-medium text-gray-700 mb-1">Whop</h3>
  <p class="text-xs text-gray-600">This is a working examples of what your payment system would resemble</p>
<p>The card design is controlled by Whop</p>
<div id="whop-checkout"></div>

</div>





</div>
</div>
               ${petitionBreadcrumbs()} 
`}


 export async function render(panel, petition = {}) {
    console.log('providerMockups(', panel, petition, ')');
    panel.innerHTML = getTemplateHTML();
const subject = await resolveSubject();

  if (subject?.approUserId) {
    loadWhopCheckout(subject);
    loadLemonCheckout(subject);
  } else {
    console.warn('⚠️ No subject available for payment mockups');
  }


//loadWhopCheckout(subject);
//loadLemonCheckout(subject);
     //? query.petitioner : 'unknown';
    console.log('Petition:', petition);
    // panel.innerHTML+= `<p class="text-xs text-gray-400 mt-4">Context: ${petition.Module} - ${petition.Section} - ${petition.Action}- ${petition.Destination}</p>`;}
   // panel.innerHTML+=petitionBreadcrumbs();//this reads 'petition' and prints the values at bottom of the render panel
  }



// WHOP: Minimal embed with correct attributes
// In loadWhopCheckout():

async function loadWhopCheckout(subject) {
  const containerId = "whop-checkout";
  const planId = "plan_fPED05pHu2vRp"; // 19:00 April 17 2026. Must synch with a plan not a product actually at Whop
  //plan_fPED05pHu2vRp  or plan_ICGyawC2V7tBU   What are these & what is a product??? I don't understand
  const approId = subject.approUserId;
  
  // ✅ Add appro_id as utm_content to return URL
  const returnUrl = `${window.location.origin}${window.location.pathname}?utm_content=${approId}`;

  const container = document.getElementById(containerId);
  if (!container) return;

  // Load Whop script
  const scriptSrc = "https://js.whop.com/static/checkout/loader.js";
  if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    document.body.appendChild(script);
  }

  // Create embed div with session OR plan + UTM passthrough
  container.innerHTML = `<div id="${containerId}-embed"></div>`;
  const embedDiv = document.getElementById(`${containerId}-embed`);
  
  // ✅ Whop will automatically forward utm_* from return URL
  embedDiv.setAttribute("data-whop-checkout-plan-id", planId);
  embedDiv.setAttribute("data-whop-checkout-return-url", returnUrl);  // ← Includes utm_content
  embedDiv.setAttribute("data-whop-checkout", "true");

  // Re-initialize if script already loaded
  if (document.querySelector(`script[src="${scriptSrc}"]`)) {
    window.dispatchEvent(new Event("whop-checkout-reload"));
  }
}


//LEMON SQUEEZY MOCK-UP ////////////////////////

async function loadLemonCheckout(subject){
await loadLemonScript();//load before creating button
const variantId ='335c43f9-185f-4bb0-a9c0-aad4b2ab56f1'; // "Move Mountains free membership (LS)"

// When generating the checkout link:
const checkoutUrl = `https://myorg.lemonsqueezy.com/checkout/buy/${variantId}?embed=1&checkout[custom][appro_id]=${subject.approUserId}`;

const container = document.getElementById("lemon-checkout");//needs section in HTML

container.innerHTML = `<div></div> <img src="/public/assets/logos/lemonsqueezy.png"
       alt="Lemon Squeezy"
       class="w-full h-full rounded" />
<div class="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
 
  <div class="flex flex-col">
    <span class="text-sm font-semibold text-gray-800">
      Move Mountains free membership (test)
    </span>
    <!--span class="text-xs text-gray-500">
      Powered by Lemon Squeezy
    </span-->
  </div>

  <a href=${checkoutUrl}
     target="_blank"
     class="ml-auto inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition">
     Click to see the process
  </a>
</div>
    <p class="text-xs text-gray-500 mt-2">
      ⚠️ Best to use the same email for checkout as your email on My Dash
    </p>
`;

window.LemonSqueezy?.setup();// re scan after changes to DOM

}

/*
async function loadLemonCheckout(subject){
  await loadLemonScript();
  const variantId = '335c43f9-185f-4bb0-a9c0-aad4b2ab56f1';

  // ✅ Correct format: checkout[custom][appro_id]
  const checkoutUrl = `https://myorg.lemonsqueezy.com/checkout/buy/${variantId}?embed=1&checkout[custom][appro_id]=${subject.approUserId}`;

  const container = document.getElementById("lemon-checkout");

  container.innerHTML = `
    <div class="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
      <img src="/assets/logos/lemonsqueezy.png" alt="Lemon Squeezy" class="w-8 h-8 rounded" />
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-gray-800">Move Mountains free membership (test)</span>
      </div>
      <a href="${checkoutUrl}"
         target="_blank"
         class="ml-auto inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition">
         View Checkout →
      </a>
    </div>
    <p class="text-xs text-gray-500 mt-2">
      ⚠️ Use the same email for checkout as your account email
    </p>
  `;

  window.LemonSqueezy?.Setup?.();
}
*/
function loadLemonScript() {
  return new Promise((resolve, reject) => {
    if (window.lemonScriptLoaded) return resolve();

    const script = document.createElement("script");
    script.src = "https://assets.lemonsqueezy.com/lemon.js";
    script.defer = true;

    script.onload = () => {
      window.lemonScriptLoaded = true;
      resolve();
    };

    script.onerror = reject;

    document.head.appendChild(script);
  });
}




//end of Lemon






  /* whop very basic email inout + buy button No info
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


// WHOP MOCK-UP  ////////////////////////
/*
 how it should look but doesn't
function loadWhopCheckout(options = {}) {
  const {
    containerId = "whop-checkout",
    planId = "plan_fPED05pHu2vRp",
    returnUrl = window.location.href,
    theme = "dark",
    onComplete = null,
    productName = "Move Mountains",
    productDescription = "Join a free community...",
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

  // Build info card (same as before)
  const isDark = theme === "dark";
  const bg = isDark ? "#1a1a2e" : "#ffffff";
  const cardBg = isDark ? "#16213e" : "#f8f9fa";
  const text = isDark ? "#e0e0e0" : "#1a1a2e";
  const textMuted = isDark ? "#a0a0b8" : "#6c757d";
  const accent = isDark ? "#4fc3f7" : "#0d6efd";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const checkColor = isDark ? "#66bb6a" : "#198754";

  const includesHTML = includes
    .map((item) => `<li style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;">
      <span style="color:${checkColor};font-size:16px;line-height:1.4;flex-shrink:0;">✓</span>
      <span style="line-height:1.4;">${item}</span>
    </li>`).join("");

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

  // ✅ FIXED: Set correct data attributes
  const embedDiv = document.getElementById(`${containerId}-embed`);
  embedDiv.setAttribute("data-whop-checkout-plan-id", planId);  // ← Added "-id"
  embedDiv.setAttribute("data-whop-checkout-return-url", returnUrl);
  embedDiv.setAttribute("data-whop-checkout-theme", theme);
  if (onComplete) {
    embedDiv.setAttribute("data-whop-checkout-on-complete", onComplete);
  }
  embedDiv.setAttribute("data-whop-checkout", "true");  // ← Added this trigger attribute

  // ✅ FIXED: Inject script with proper loading check
  const scriptSrc = "https://js.whop.com/static/checkout/loader.js";
  if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.onload = () => {
      // Optional: dispatch event after load
      window.dispatchEvent(new Event("whop-checkout-loaded"));
    };
    document.body.appendChild(script);
  } else {
    // Re-scan DOM for new embeds
    window.dispatchEvent(new Event("whop-checkout-reload"));
  }
}
*/
// ./mutate/providerMockups.js




















