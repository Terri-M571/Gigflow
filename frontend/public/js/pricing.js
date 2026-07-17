/* ==========================================================================
   GIGFLOW - PRICING & SUBSCRIPTION LOGIC (pricing.js)
   ========================================================================== */

const PRICING_DATA = {
    features: {
        free: [
            "5 Resume Scans per month",
            "ATS Score",
            "Resume Generator",
            "Resume Manager",
            "Job Tracker",
            "Thank You Notes"
        ],
        premium: [
            "Unlimited Resume Scans",
            "AI Resume Optimization",
            "AI Cover Letter Generator",
            "AI Resume Generator",
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
        monthly: {
            id: 'plan_monthly',
            name: 'Monthly Plan',
            price: {
                USD: { amount: 9.99, text: '$9.99', period: '/month', subtext: 'Billed monthly' },
                KES: { amount: 999, text: 'KSh 999', period: '/month', subtext: 'Billed monthly' }
            },
            badge: null,
            buttonText: 'Subscribe Monthly',
            buttonAction: 'openSubscriptionModal("plan_monthly")'
        },
        quarterly: {
            id: 'plan_quarterly',
            name: 'Quarterly Plan',
            price: {
                USD: { amount: 24.99, text: '$24.99', period: '/quarter', subtext: 'Save 16% over monthly' },
                KES: { amount: 2500, text: 'KSh 2,500', period: '/quarter', subtext: 'Save 16% over monthly' }
            },
            badge: 'Most Popular',
            buttonText: 'Subscribe Quarterly',
            buttonAction: 'openSubscriptionModal("plan_quarterly")'
        },
        annual: {
            id: 'plan_annual',
            name: 'Annual Plan',
            price: {
                USD: { amount: 89.99, text: '$89.99', period: '/year', subtext: 'Save 25% over monthly' },
                KES: { amount: 8999, text: 'KSh 8,999', period: '/year', subtext: 'Save 25% over monthly' }
            },
            badge: 'Best Value',
            buttonText: 'Subscribe Annually',
            buttonAction: 'openSubscriptionModal("plan_annual")'
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
    const monthlyPrice = PRICING_DATA.plans.monthly.price[currentCurrency];
    document.getElementById('price-monthly').innerHTML = `<span>${monthlyPrice.text}</span><span class="period">${monthlyPrice.period}</span>`;
    document.getElementById('subtext-monthly').textContent = monthlyPrice.subtext;
    
    // Quarterly Plan
    const qPrice = PRICING_DATA.plans.quarterly.price[currentCurrency];
    document.getElementById('price-quarterly').innerHTML = `<span>${qPrice.text}</span><span class="period">${qPrice.period}</span>`;
    document.getElementById('subtext-quarterly').textContent = qPrice.subtext;

    // Monthly Plan
    const annualPrice = PRICING_DATA.plans.annual.price[currentCurrency];
    document.getElementById('price-annual').innerHTML = `<span>${annualPrice.text}</span><span class="period">${annualPrice.period}</span>`;
    document.getElementById('subtext-annual').textContent = annualPrice.subtext;

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
