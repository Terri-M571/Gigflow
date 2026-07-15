/* ==========================================================================
   GIGFLOW - PRICING & SUBSCRIPTION LOGIC (pricing.js)
   ========================================================================== */

const PRICING_DATA = {
    features: {
        free: [
            "5 Resume Scans per month",
            "ATS Score",
            "Resume Builder",
            "Resume Manager",
            "Job Tracker",
            "Thank You Notes"
        ],
        premium: [
            "Unlimited Resume Scans",
            "AI Resume Optimization",
            "AI Cover Letter Generator",
            "AI Resume Builder",
            "AI Bullet Point Generator",
            "ATS Resume Checker",
            "AI Job Match",
            "LinkedIn Optimizer",
            "Keyword Optimization",
            "Resume Manager",
            "Job Tracker",
            "Chrome Extension",
            "ATS-Friendly Templates",
            "Premium Cover Letter Templates",
            "Learning Center"
        ]
    },
    plans: {
        free: {
            id: 'plan_free',
            name: 'Free Plan',
            price: {
                USD: { amount: 0, text: '$0', period: '' },
                KES: { amount: 0, text: 'KSh 0', period: '' }
            },
            badge: null,
            buttonText: 'Get Started Free',
            buttonAction: 'location.href="dashboard.html"'
        },
        quarterly: {
            id: 'plan_quarterly',
            name: 'Quarterly Plan',
            price: {
                USD: { amount: 29.99, text: '$29.99', period: '/month', subtext: 'Billed every 3 months' },
                KES: { amount: 3900, text: 'KSh 3,900', period: '/month', subtext: 'Billed KSh 11,700 every 3 months' }
            },
            badge: 'Most Popular',
            buttonText: 'Start 7-Day Free Trial',
            buttonAction: 'openSubscriptionModal("plan_quarterly")'
        },
        monthly: {
            id: 'plan_monthly',
            name: 'Monthly Plan',
            price: {
                USD: { amount: 49.99, text: '$49.99', period: '/month', subtext: '' },
                KES: { amount: 6500, text: 'KSh 6,500', period: '/month', subtext: '' }
            },
            badge: null,
            buttonText: 'Subscribe Now',
            buttonAction: 'openSubscriptionModal("plan_monthly")'
        }
    }
};

let currentCurrency = 'USD'; // Default fallback

document.addEventListener('DOMContentLoaded', () => {
    initCurrency();
    renderPricing();
    setupModalListeners();
});

function initCurrency() {
    // Check local storage first
    const saved = localStorage.getItem('gigflow_currency');
    if (saved && (saved === 'KES' || saved === 'USD')) {
        currentCurrency = saved;
    } else {
        // Detect via timezone
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz && (tz === 'Africa/Nairobi' || tz.includes('Africa'))) {
                currentCurrency = 'KES';
            }
        } catch (e) {
            console.warn("Timezone detection failed", e);
        }
        localStorage.setItem('gigflow_currency', currentCurrency);
    }
    
    // Update the UI Toggle switch
    const toggle = document.getElementById('currency-toggle');
    if (toggle) {
        toggle.checked = (currentCurrency === 'KES');
        toggle.addEventListener('change', (e) => {
            currentCurrency = e.target.checked ? 'KES' : 'USD';
            localStorage.setItem('gigflow_currency', currentCurrency);
            renderPricing();
        });
    }
}

function renderPricing() {
    // Free Plan
    const freePrice = PRICING_DATA.plans.free.price[currentCurrency];
    document.getElementById('price-free').innerHTML = `<span>${freePrice.text}</span>`;
    
    // Quarterly Plan
    const qPrice = PRICING_DATA.plans.quarterly.price[currentCurrency];
    document.getElementById('price-quarterly').innerHTML = `<span>${qPrice.text}</span><span class="period">${qPrice.period}</span>`;
    document.getElementById('subtext-quarterly').textContent = qPrice.subtext;

    // Monthly Plan
    const mPrice = PRICING_DATA.plans.monthly.price[currentCurrency];
    document.getElementById('price-monthly').innerHTML = `<span>${mPrice.text}</span><span class="period">${mPrice.period}</span>`;
    document.getElementById('subtext-monthly').textContent = mPrice.subtext;

    // Update Modal Curriculum Text if open
    document.getElementById('modal-currency-display').textContent = currentCurrency;
}

/* ==========================================================================
   MODAL LOGIC
   ========================================================================== */
let selectedPlanId = null;

function openSubscriptionModal(planId) {
    selectedPlanId = planId;
    const modal = document.getElementById('subscription-modal');
    
    // Reset to Step 1
    showModalStep(1);
    
    // Sync internal modal radio buttons with current currency
    const radioId = currentCurrency === 'KES' ? 'modal-curr-kes' : 'modal-curr-usd';
    document.getElementById(radioId).checked = true;

    modal.classList.add('active');
}

function closeSubscriptionModal() {
    const modal = document.getElementById('subscription-modal');
    modal.classList.remove('active');
    setTimeout(() => { showModalStep(1); }, 300); // reset after fade out
}

function showModalStep(step) {
    document.querySelectorAll('.modal-step').forEach(el => el.style.display = 'none');
    document.getElementById(`modal-step-${step}`).style.display = 'block';
}

function handleStep1Submit() {
    // Get chosen currency from modal
    const kesChecked = document.getElementById('modal-curr-kes').checked;
    currentCurrency = kesChecked ? 'KES' : 'USD';
    
    // Persist and update background
    localStorage.setItem('gigflow_currency', currentCurrency);
    renderPricing();
    
    const toggle = document.getElementById('currency-toggle');
    if (toggle) toggle.checked = kesChecked;

    // Render Step 2 Payment options based on currency
    renderPaymentMethods();
    showModalStep(2);
}

function renderPaymentMethods() {
    const container = document.getElementById('payment-methods-container');
    container.innerHTML = ''; // Clear

    if (currentCurrency === 'KES') {
        container.innerHTML = `
            <label class="payment-method-card">
                <input type="radio" name="payment_method" value="mpesa" checked>
                <div class="pm-content">
                    <span class="material-symbols-outlined pm-icon" style="color:#4caf50;">send_to_mobile</span>
                    <span class="pm-name">M-Pesa</span>
                </div>
            </label>
            <label class="payment-method-card">
                <input type="radio" name="payment_method" value="card">
                <div class="pm-content">
                    <span class="material-symbols-outlined pm-icon" style="color:#004AC6;">credit_card</span>
                    <span class="pm-name">Visa / Mastercard</span>
                </div>
            </label>
            <label class="payment-method-card disabled" title="Coming Soon">
                <input type="radio" name="payment_method" value="airtel" disabled>
                <div class="pm-content">
                    <span class="material-symbols-outlined pm-icon" style="color:#f44336;">phone_iphone</span>
                    <span class="pm-name">Airtel Money <span class="badge" style="font-size:0.6rem; padding: 2px 6px;">Soon</span></span>
                </div>
            </label>
        `;
    } else {
        container.innerHTML = `
            <label class="payment-method-card">
                <input type="radio" name="payment_method" value="card" checked>
                <div class="pm-content">
                    <span class="material-symbols-outlined pm-icon" style="color:#004AC6;">credit_card</span>
                    <span class="pm-name">Credit/Debit Card</span>
                </div>
            </label>
            <label class="payment-method-card">
                <input type="radio" name="payment_method" value="apple_pay">
                <div class="pm-content">
                    <span class="material-symbols-outlined pm-icon" style="color:#000;">phone_iphone</span>
                    <span class="pm-name">Apple Pay</span>
                </div>
            </label>
            <label class="payment-method-card">
                <input type="radio" name="payment_method" value="google_pay">
                <div class="pm-content">
                    <span class="material-symbols-outlined pm-icon" style="color:#4285f4;">android</span>
                    <span class="pm-name">Google Pay</span>
                </div>
            </label>
            <label class="payment-method-card disabled" title="Coming Soon">
                <input type="radio" name="payment_method" value="paypal" disabled>
                <div class="pm-content">
                    <span class="material-symbols-outlined pm-icon" style="color:#003087;">account_balance_wallet</span>
                    <span class="pm-name">PayPal <span class="badge" style="font-size:0.6rem; padding: 2px 6px;">Soon</span></span>
                </div>
            </label>
        `;
    }
}

function handleStep2Submit() {
    const btn = document.getElementById('btn-step-2');
    const orig = btn.innerHTML;
    btn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin 0.8s linear infinite;">refresh</span> Processing...`;
    btn.disabled = true;

    // Simulate API delay
    setTimeout(() => {
        btn.innerHTML = orig;
        btn.disabled = false;
        showModalStep(3); // Success/Mock Screen
    }, 1500);
}

function setupModalListeners() {
    // Close on background click
    const modal = document.getElementById('subscription-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeSubscriptionModal();
        });
    }
}
