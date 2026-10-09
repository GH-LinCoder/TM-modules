// ./mutate/moneyManagementSection.js
console.log('moneyManagementSection.js loaded');

import { petitionBreadcrumbs } from '../ui/breadcrumb.js';

function getTemplateHTML() {
  console.log('getTemplateHTML()');
  return `
<!-- Money Management Section -->
<div class="bg-green-100 rounded-lg shadow p-6" data-section="money-management">
  <h2 class="text-lg font-semibold mb-2">Money 💷💵💶</h2>
  <p class="text-sm text-gray-500 mb-4">Connect a payment processor to accept subscriptions, memberships, and donations</p>

  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6" id="payment-processor-cards">

    <!-- Return Card -->
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="admin-settings-section">
      <h3 class="text-sm font-medium text-gray-700 mb-1">◀️ Return to Settings</h3>
      <p class="text-xs text-gray-600">Go back to the main admin settings section.</p>
    </div>

    <!-- Stripe Card (Recommended) -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
         data-action="stripe-connect" 
         data-processor="stripe">
      <div class="flex items-center mb-2">
        <!--svg class="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <!-- Stripe Logo Placeholder -->
          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.685-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.655 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.575 3.445 2.585 0 .98-.871 1.545-2.437 1.545-1.931 0-5.115-.95-7.076-2.05l-.89 5.615C5.085 23.058 8.705 24 11.714 24c2.641 0 4.843-.625 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
        </svg-->
  <img 
    src="/assets/logos/Stripe.png" 
    alt="Stripe" 
    class="w-8 h-8 mr-2 object-contain"
  />

        <h3 class="text-sm font-medium text-blue-700">Stripe</h3>
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

    <!-- Whop Card (Simplest) -->
    <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
         data-action="whop-connect" 
         data-processor="whop">
      <div class="flex items-center mb-2">
        <!--div class="w-8 h-8 mr-2 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">W</div-->
  <img 
    src="/assets/logos/Whop.png" 
    alt="Whop" 
    class="w-8 h-8 mr-2 object-contain"
  />
        <!--h3 class="text-sm font-medium text-purple-700">Whop</h3-->
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
        <!--div class="w-8 h-8 mr-2 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-sm">🍋</div-->
  <img 
    src="/assets/logos/Lemonsqueezy.png" 
    alt="Lemon Squeezy" 
    class="w-8 h-8 mr-2 object-contain"
  />
        <!--h3 class="text-sm font-medium text-yellow-700">Lemon Squeezy</h3-->
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

    <!-- Polar Card (Open Source) -->
    <div class="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
         data-action="polar-connect" 
         data-processor="polar">
      <div class="flex items-center mb-2">
        <!-- div class="w-8 h-8 mr-2 bg-green-600 rounded flex items-center justify-center text-white font-bold text-sm">P</div-->
          <img 
    src="/assets/logos/Polar.png" 
    alt="Polar" 
    class="w-8 h-8 mr-2 object-contain"
  />
        <h3 class="text-sm font-medium text-green-700">Polar</h3>
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

    <!-- BTCPay Card (Self-Hosted) -->
    <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
         data-action="btcpay-connect" 
         data-processor="btcpay">
      <div class="flex items-center mb-2">
        <!-- div class="w-8 h-8 mr-2 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-sm">₿</div-->
          <img 
    src="/assets/logos/BTCPay.png" 
    alt="BTCPay" 
    class="w-8 h-8 mr-2 object-contain"
  />
        <!--h3 class="text-sm font-medium text-orange-700">BTCPay Server</h3-->
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

    <!-- Revenue Snapshot Card -->
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4" data-action="revenue-dashboard">
      <h3 class="text-sm font-medium text-gray-700 mb-1">📊 Revenue Snapshot</h3>
      <p class="text-xs text-gray-600">View total contributions and active subscriptions. Plan your budget.</p>
    </div>

  </div>

  <!-- Info Banner -->
  <div class="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
    <h4 class="text-sm font-semibold text-gray-800 mb-2">💡 How It Works</h4>
    <ol class="text-xs text-gray-600 space-y-1 list-decimal list-inside">
      <li>Choose a payment processor and create an account (links above)</li>
      <li>Connect your account keys in the configuration panel</li>
      <li>Create payment plans (e.g., "Monthly Supporter £10")</li>
      <li>Link plans to permission bundles (payment unlocks access)</li>
      <li>Embed payment links in your surveys or tasks</li>
      <li>Track subscriptions in the "Pay" tab of Display Relations</li>
    </ol>
  </div>
</div>
${petitionBreadcrumbs()}
`;
}

export function render(panel, petition = {}) {
  console.log('moneyManagement Render(', panel, petition, ')');
  panel.innerHTML = getTemplateHTML();

  // Add click handlers for processor cards
  const processorCards = panel.querySelectorAll('[data-processor]');
  processorCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Prevent triggering the link if clicking the anchor
      if (e.target.tagName === 'A') return;
      
      const processor = card.dataset.processor;
      console.log('Payment processor selected:', processor);
      
      // Future: Open configuration modal for this processor
      // For now, the link handles the external navigation
    });
  });

  console.log('Petition:', petition);
}