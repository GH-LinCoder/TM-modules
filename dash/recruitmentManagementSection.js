// ./work/dash/recruitmentManagementSection.js
console.log('recruitmentManagementSection.js loaded');
import { petitionBreadcrumbs } from '../ui/breadcrumb.js';
import { resolveSubject } from '../utils/contextSubjectHideModules.js';
import { showToast } from '../ui/showToast.js';

/**
 * Generates the referral URL for the current user
 * @returns {Promise<string>} The full referral URL
 */
async function generateReferralLink() {
    const subject = await resolveSubject();
    if (!subject?.approUserId) {
        throw new Error('Unable to determine user approId');
    }
    
    // window.location.origin gives the base URL (e.g., https://app.example.com)
    // No hardcoding needed — works in dev, staging, production
    const baseUrl = window.location.origin;
    return `${baseUrl}/index.html?ref=${subject.approUserId}`;
}

/**
 * Copies text to clipboard with fallback for older browsers
 * @param {string} text - The text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
    // Modern, standardized API (Chrome 66+, Firefox 63+, Safari 13.1+, Edge 79+)
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.warn('Clipboard API failed, trying fallback:', err);
        }
    }
    
    // Fallback: execCommand with temporary textarea (works in older browsers)
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';  // Avoid scrolling to bottom
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    } catch (err) {
        console.error('Clipboard fallback failed:', err);
        return false;
    }
}

/**
 * Shows a temporary toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 */
/*
function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existing = document.getElementById('recruitment-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.id = 'recruitment-toast';
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg text-sm font-medium z-50 ${
        type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => toast.remove(), 3000);
} */

function getTemplateHTML() {
    return `
<!-- Recruitment Management Section -->
<div class="bg-green-50 rounded-lg shadow p-6" data-section="recruitment-management">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Invite Others to Join 👥</h2>
    
    <!-- Explanation -->
    <div class="mb-6 bg-white rounded-lg p-4 border border-green-200">
        <h3 class="text-sm font-medium text-green-800 mb-2">How it works</h3>
        <ol class="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>Copy your unique referral link below</li>
            <li>Share it via email, social media, or group chat</li>
            <li>When someone signs up using your link, they are linked to you</li>
            <li>You receive recognition when they complete the welcome survey</li>
        </ol>
        <p class="mt-3 text-xs text-gray-500 italic">
            Note: Your link contains your public appro ID — it does not grant access to your account.
        </p>
    </div>
    
    <!-- Link Generator -->
    <div class="bg-white rounded-lg p-4 border border-gray-200 mb-6">
        <h3 class="text-sm font-medium text-gray-800 mb-3">Your Referral Link</h3>
        <div class="flex gap-2">
            <input 
                type="text" 
                readonly 
                id="referral-link-input"
                class="flex-1 p-2 text-sm border rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Generating your link..."
            />
            <button 
                id="copy-referral-btn"
                class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
            >
                Copy
            </button>
        </div>
        <p id="copy-status" class="mt-2 text-xs text-gray-500 h-4"></p>
    </div>
    
    <!-- Optional: Stats (can be populated later) -->
    <div class="bg-white rounded-lg p-4 border border-gray-200">
        <h3 class="text-sm font-medium text-gray-800 mb-2">Your Impact</h3>
        <div class="grid grid-cols-2 gap-4 text-center">
            <div>
                <div class="text-2xl font-bold text-blue-600" id="recruited-count">-</div>
                <div class="text-xs text-gray-500">Invited</div>
            </div>
            <div>
                <div class="text-2xl font-bold text-green-600" id="activated-count">-</div>
                <div class="text-xs text-gray-500">Activated</div>
            </div>
        </div>
        <p class="mt-3 text-xs text-gray-500">
            "Activated" means they completed the welcome survey.
        </p>
    </div>
</div>
${petitionBreadcrumbs()}
`;
}

export async function render(panel, petition = {}) {
    console.log('recruitmentManagementSection.render()', { panel, petition });
    
    // Inject the template
    panel.innerHTML = getTemplateHTML();
    
    // Get DOM references
    const linkInput = document.getElementById('referral-link-input');
    const copyBtn = document.getElementById('copy-referral-btn');
    const copyStatus = document.getElementById('copy-status');
    const recruitedCount = document.getElementById('recruited-count');
    const activatedCount = document.getElementById('activated-count');
    
    // Generate and display the referral link
    try {
        const referralLink = await generateReferralLink();
        linkInput.value = referralLink;
        copyBtn.disabled = false;
        copyStatus.textContent = 'Link ready to copy';
    } catch (error) {
        console.error('Failed to generate referral link:', error);
        linkInput.value = 'Error generating link';
        copyBtn.disabled = true;
        copyStatus.textContent = 'Unable to generate link';
        copyStatus.className = 'mt-2 text-xs text-red-500 h-4';
    }
    
    // Wire up copy button
    copyBtn?.addEventListener('click', async () => {
        const link = linkInput.value;
        if (!link || link.startsWith('Error')) return;
        
        copyBtn.disabled = true;
        copyBtn.textContent = 'Copying...';
        
        const success = await copyToClipboard(link);
        
        if (success) {
            copyStatus.textContent = '✓ Copied to clipboard!';
            copyStatus.className = 'mt-2 text-xs text-green-600 h-4 font-medium';
            showToast('Referral link copied!', 'success');
        } else {
            copyStatus.textContent = '✗ Copy failed. Select and copy manually.';
            copyStatus.className = 'mt-2 text-xs text-red-500 h-4';
            showToast('Failed to copy link', 'error');
            // Fallback: select the text for manual copying
            linkInput.select();
        }
        
        // Reset button after 2 seconds
        setTimeout(() => {
            copyBtn.disabled = false;
            copyBtn.textContent = 'Copy';
        }, 2000);
    });
    
    // Optional: Load recruitment stats (if you have the query ready)
    // For now, we leave as "-" placeholder
    // recruitedCount.textContent = '3';
    // activatedCount.textContent = '2';
}