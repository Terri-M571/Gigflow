/* ==========================================================================
   GIGFLOW - AUTHENTICATION CONTROLLER (auth.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Password Visibility Toggle
    const toggleButtons = document.querySelectorAll('.password-toggle');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = 'visibility_off';
            } else {
                input.type = 'password';
                btn.textContent = 'visibility';
            }
        });
    });

    // 2. Password Strength Check
    const pwdInput = document.getElementById('signup-password');
    const strengthIndicator = document.getElementById('password-strength-bar');
    const strengthText = document.getElementById('password-strength-text');

    if (pwdInput && strengthIndicator) {
        pwdInput.addEventListener('input', () => {
            const score = evaluatePassword(pwdInput.value);
            updateStrengthBar(score);
        });
    }

    // 3. Form Submissions Verification
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotForm = document.getElementById('forgot-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }

    // 4. Setup Dynamic OAuth Buttons Visibility
    setupOAuthButtons();
});

async function setupOAuthButtons() {
    try {
        const config = await API.getAuthConfig();
        if (config && config.oauth) {
            const googleBtn = document.querySelector('button[onclick*="google"]');
            const linkedinBtn = document.querySelector('button[onclick*="linkedin"]');
            const microsoftBtn = document.querySelector('button[onclick*="microsoft"]');

            if (googleBtn) {
                if (config.oauth.google) {
                    googleBtn.style.display = 'flex';
                } else {
                    googleBtn.style.display = 'none';
                }
            }

            if (linkedinBtn) {
                if (config.oauth.linkedin) {
                    linkedinBtn.style.display = 'flex';
                    linkedinBtn.disabled = false;
                } else {
                    linkedinBtn.disabled = true;
                    linkedinBtn.style.opacity = '0.5';
                    linkedinBtn.style.cursor = 'not-allowed';
                    linkedinBtn.title = 'LinkedIn Login not configured';
                    linkedinBtn.style.display = 'none'; // Also hiding to keep UI clean
                }
            }

            if (microsoftBtn) {
                if (config.oauth.microsoft) {
                    microsoftBtn.style.display = 'flex';
                } else {
                    microsoftBtn.style.display = 'none';
                }
            }

            // If all social logins are hidden, hide the OR divider
            if (!config.oauth.google && !config.oauth.linkedin && !config.oauth.microsoft) {
                const divider = document.querySelector('.auth-card > div[style*="margin: 24px"]');
                if (divider) divider.style.display = 'none';
                const signupDivider = document.querySelector('.card > div[style*="margin: 24px"]');
                if (signupDivider) signupDivider.style.display = 'none';
            }
        }
    } catch (e) {
        console.warn("Failed to check OAuth configs:", e);
    }
}

function evaluatePassword(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
}

function updateStrengthBar(score) {
    const bars = document.querySelectorAll('.pwd-strength-bar');
    const textEl = document.getElementById('password-strength-text');
    
    bars.forEach((bar, idx) => {
        bar.className = 'pwd-strength-bar'; // reset
        if (idx < score) {
            if (score <= 1) {
                bar.classList.add('weak');
                if (textEl) textEl.textContent = 'Weak';
            } else if (score <= 3) {
                bar.classList.add('medium');
                if (textEl) textEl.textContent = 'Good';
            } else {
                bar.classList.add('strong');
                if (textEl) textEl.textContent = 'Strong';
            }
        }
    });
}

/* ==========================================================================
   GREETING UTILITY — Shared across all pages
   ========================================================================== */

function getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5  && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
}

function getGreetingEmoji() {
    const hour = new Date().getHours();
    if (hour >= 5  && hour < 12) return '☀️';
    if (hour >= 12 && hour < 17) return '🌤️';
    if (hour >= 17 && hour < 21) return '🌆';
    return '🌙';
}

function getFirstName(fullName) {
    if (!fullName) return 'there';
    return fullName.trim().split(' ')[0];
}

function buildGreeting(fullName) {
    return `${getTimeGreeting()}, ${getFirstName(fullName)}! ${getGreetingEmoji()}`;
}

function injectGreeting(selector) {
    const el = document.querySelector(selector);
    if (!el) return;

    const name = window.currentUser?.full_name || 'there';
    el.textContent = buildGreeting(name);
}

// Expose globally
window.buildGreeting  = buildGreeting;
window.getFirstName   = getFirstName;
window.getTimeGreeting = getTimeGreeting;
window.getGreetingEmoji = getGreetingEmoji;
window.injectGreeting = injectGreeting;

// Validate email helper
function validateEmailFormat(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/* ==========================================================================
   LOGIN HANDLER
   ========================================================================== */
async function handleLogin(e) {
    e.preventDefault();

    const emailEl    = document.getElementById('login-email');
    const passwordEl = document.getElementById('login-password');
    const btn = e.target.querySelector('button[type="submit"]');

    if (!emailEl || !passwordEl) return;

    const email    = emailEl.value.trim();
    const password = passwordEl.value;

    if (!email || !password) {
        showToast('❌ Please fill in all fields', 'error');
        return;
    }

    const originalText = btn.innerHTML;

    // Validate email format
    if (!validateEmailFormat(email)) {
        showToast('❌ Invalid email format', 'error');
        return;
    }

    btn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin 0.8s linear infinite;">refresh</span> Logging in...`;
    btn.disabled = true;

    try {
        const response = await API.login(email, password);
        window.currentUser = response.user;

        const greeting = buildGreeting(response.user.full_name);
        showToast(`✔ Login successful. ${greeting}`, 'success');

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1300);

    } catch (err) {
        // Highlight errors clearly (Incorrect password, Email not found, Backend server is not running)
        const errMsg = err.message.startsWith('❌') ? err.message : `❌ ${err.message}`;
        showToast(errMsg, 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

/* ==========================================================================
   SIGNUP HANDLER
   ========================================================================== */
async function handleSignup(e) {
    e.preventDefault();

    const name     = document.getElementById('signup-name').value.trim();
    const industry = document.getElementById('signup-industry-value')?.value || document.getElementById('signup-industry').value;
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password')?.value;
    const agree    = document.getElementById('signup-agree')?.checked;
    
    const btn = e.target.querySelector('button[type="submit"]');

    if (!name || !industry || !email || !password || !confirmPassword) {
        showToast('❌ Please fill in all required fields', 'error');
        return;
    }

    // Validate email format
    if (!validateEmailFormat(email)) {
        showToast('❌ Invalid email format', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('❌ Passwords do not match', 'error');
        return;
    }

    if (document.getElementById('signup-agree') && !agree) {
        showToast('❌ You must agree to the Terms of Service', 'error');
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin 0.8s linear infinite;">refresh</span> Creating...`;
    btn.disabled = true;

    try {
        const response = await API.register({ fullName: name, email, password, industry });
        
        if (response.user) {
            window.currentUser = response.user;
            showToast('✔ Account created successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'onboarding.html';
            }, 1500);
        } else {
            showToast(response.message || '✔ Verification link sent to email.', 'success');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }

    } catch (err) {
        const errMsg = err.message.startsWith('❌') ? err.message : `❌ ${err.message}`;
        showToast(errMsg, 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

/* ==========================================================================
   FORGOT PASSWORD & RESET HANDLERS
   ========================================================================== */
async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();
    const btn = document.getElementById('forgot-btn');
    
    if (!email) {
        showToast('❌ Please enter your email address', 'error');
        return;
    }

    if (!validateEmailFormat(email)) {
        showToast('❌ Invalid email format', 'error');
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin 0.8s linear infinite;">refresh</span> Sending...`;
    btn.disabled = true;

    try {
        await API.requestPasswordReset(email);
        showToast(`✔ Password reset link sent to your email.`, 'success');
        btn.innerHTML = originalText;
        btn.disabled = false;
    } catch (err) {
        const errMsg = err.message.startsWith('❌') ? err.message : `❌ ${err.message}`;
        showToast(errMsg, 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function handleResetPassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    
    // Extract token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
        showToast('❌ Invalid or missing reset token', 'error');
        return;
    }

    const password = document.getElementById('reset-password').value;
    const confirmPassword = document.getElementById('reset-confirm-password').value;
    const btn = document.getElementById('reset-btn');

    if (!password || !confirmPassword) {
        showToast('❌ Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('❌ Passwords do not match', 'error');
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin 0.8s linear infinite;">refresh</span> Resetting...`;
    btn.disabled = true;

    try {
        await API.resetPassword(token, password);
        showToast('✔ Password reset successfully! Redirecting to login...', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    } catch (err) {
        const errMsg = err.message.startsWith('❌') ? err.message : `❌ ${err.message}`;
        showToast(errMsg, 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function checkSession() {
    const publicPages = ['login.html', 'signup.html', 'index.html', 'pricing.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Auth Check
    if (!window.currentUser && !publicPages.some(p => currentPage.includes(p))) {
        window.location.href = 'login.html';
        return;
    }

    // Profile Completion Check
    if (window.currentUser) {
        const isComplete = window.currentUser.is_complete === true || String(window.currentUser.is_complete) === '1' || String(window.currentUser.is_complete).toLowerCase() === 'true';
        
        if (!isComplete && currentPage !== 'onboarding.html') {
            window.location.href = 'onboarding.html';
            return;
        }
        
        if (isComplete && (currentPage === 'login.html' || currentPage === 'signup.html' || currentPage === 'onboarding.html')) {
            window.location.href = 'dashboard.html';
            return;
        }
    }
}

window.checkSession = checkSession;
window.handleResetPassword = handleResetPassword;
