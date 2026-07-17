const fs = require('fs');
const path = require('path');

const pricingJsPath = path.join(__dirname, 'frontend', 'public', 'js', 'pricing.js');
const pricingHtmlPath = path.join(__dirname, 'frontend', 'public', 'pricing.html');

// 1. Update pricing.js
let jsContent = fs.readFileSync(pricingJsPath, 'utf8');

jsContent = jsContent.replace(/plans: \{[\s\S]*?\n    \}/, `plans: {
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
    }`);

jsContent = jsContent.replace(/const freePrice = PRICING_DATA\.plans\.free\.price\[currentCurrency\];[\s\S]*?document\.getElementById\('price-free'\)\.innerHTML = `<span>\$\{freePrice\.text\}<\/span>`;/, `const monthlyPrice = PRICING_DATA.plans.monthly.price[currentCurrency];
    document.getElementById('price-monthly').innerHTML = \`<span>\${monthlyPrice.text}</span><span class="period">\${monthlyPrice.period}</span>\`;
    document.getElementById('subtext-monthly').textContent = monthlyPrice.subtext;`);

jsContent = jsContent.replace(/const mPrice = PRICING_DATA\.plans\.monthly\.price\[currentCurrency\];[\s\S]*?document\.getElementById\('subtext-monthly'\)\.textContent = mPrice\.subtext;/, `const annualPrice = PRICING_DATA.plans.annual.price[currentCurrency];
    document.getElementById('price-annual').innerHTML = \`<span>\${annualPrice.text}</span><span class="period">\${annualPrice.period}</span>\`;
    document.getElementById('subtext-annual').textContent = annualPrice.subtext;`);

fs.writeFileSync(pricingJsPath, jsContent, 'utf8');

// 2. Update pricing.html
let htmlContent = fs.readFileSync(pricingHtmlPath, 'utf8');

htmlContent = htmlContent.replace(/<!-- Free Plan -->[\s\S]*?<!-- Quarterly Plan -->/, `<!-- Monthly Plan -->
                <div class="pricing-card">
                    <div class="card-header">
                        <div class="card-name">Monthly Plan</div>
                        <div class="card-price" id="price-monthly"><span>KSh 999</span><span class="period">/month</span></div>
                        <div class="card-subtext" id="subtext-monthly">Billed monthly</div>
                    </div>
                    <ul class="feature-list" id="features-monthly">
                        <li class="feature-item"><span class="material-symbols-outlined feature-icon">check_circle</span> Unlimited Resume Scans</li>
                        <li class="feature-item"><span class="material-symbols-outlined feature-icon">check_circle</span> ATS Score</li>
                        <li class="feature-item"><span class="material-symbols-outlined feature-icon">check_circle</span> Resume Generator</li>
                        <li class="feature-item"><span class="material-symbols-outlined feature-icon">check_circle</span> Resume Manager</li>
                        <li class="feature-item"><span class="material-symbols-outlined feature-icon">check_circle</span> Job Tracker</li>
                        <li class="feature-item"><span class="material-symbols-outlined feature-icon">check_circle</span> Thank You Notes</li>
                    </ul>
                    <button class="btn-pricing btn-pricing-outline" onclick="openSubscriptionModal('plan_monthly')">Subscribe Monthly</button>
                </div>

                <!-- Quarterly Plan -->`);

htmlContent = htmlContent.replace(/<!-- Monthly Plan -->[\s\S]*?<\/main>/, `<!-- Annual Plan -->
                <div class="pricing-card">
                    <div class="popular-badge" style="background-color: var(--gigflow-amber);">Best Value</div>
                    <div class="card-header">
                        <div class="card-name">Annual Plan</div>
                        <div class="card-price" id="price-annual"><span>KSh 8,999</span><span class="period">/year</span></div>
                        <div class="card-subtext" id="subtext-annual">Save 25% over monthly</div>
                    </div>
                    <ul class="feature-list">
                        <li class="feature-item"><span class="material-symbols-outlined feature-icon">star</span> <strong>All Premium Features included</strong></li>
                        <li class="feature-item"><span class="material-symbols-outlined feature-icon">check_circle</span> Unlimited Resume Scans</li>
                        <li class="feature-item"><span class="material-symbols-outlined feature-icon">check_circle</span> AI Resume Optimization</li>
                        <li class="feature-item"><span class="material-symbols-outlined feature-icon">check_circle</span> AI Cover Letter Generator</li>
                        <li class="feature-item"><span class="material-symbols-outlined feature-icon">check_circle</span> ATS-Friendly Templates</li>
                        <li class="feature-item"><span class="material-symbols-outlined feature-icon">check_circle</span> AI Job Match</li>
                    </ul>
                    <button class="btn-pricing btn-pricing-outline" onclick="openSubscriptionModal('plan_annual')">Subscribe Annually</button>
                </div>

            </div>
        </main>`);

fs.writeFileSync(pricingHtmlPath, htmlContent, 'utf8');

console.log('Pricing updated successfully!');
