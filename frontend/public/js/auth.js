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
});

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

/**
 * Returns a time-based greeting string: "Good Morning", "Good Afternoon",
 * "Good Evening", or "Good Night" based on local hour.
 */
function getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5  && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
}

/**
 * Returns the greeting emoji matching the time of day.
 */
function getGreetingEmoji() {
    const hour = new Date().getHours();
    if (hour >= 5  && hour < 12) return '☀️';
    if (hour >= 12 && hour < 17) return '🌤️';
    if (hour >= 17 && hour < 21) return '🌆';
    return '🌙';
}

/**
 * Extracts the first name from a full name string.
 * "Sarah Wanjiku" → "Sarah"
 */
function getFirstName(fullName) {
    if (!fullName) return 'there';
    return fullName.trim().split(' ')[0];
}

/**
 * Builds and returns the full personalized greeting string.
 * e.g. "Good Morning, Sarah! ☀️"
 */
function buildGreeting(fullName) {
    return `${getTimeGreeting()}, ${getFirstName(fullName)}! ${getGreetingEmoji()}`;
}

/**
 * Injects the personalized greeting into any element matching `selector`.
 * Falls back gracefully if no session or element found.
 */
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

async function handleLogin(e) {
    e.preventDefault();

    const emailEl    = document.getElementById('login-email');
    const passwordEl = document.getElementById('login-password');
    const btn = e.target.querySelector('button[type="submit"]');

    if (!emailEl || !passwordEl) return;

    const email    = emailEl.value.trim();
    const password = passwordEl.value;

    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin 0.8s linear infinite;">refresh</span> Logging in...`;
    btn.disabled = true;

    try {
        const response = await API.login(email, password);
        window.currentUser = response.user;

        const greeting = buildGreeting(response.user.full_name);
        showToast(`${greeting} Welcome back! 🎉`, 'success');

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1300);

    } catch (err) {
        showToast(err.message || 'Invalid email or password combination', 'error');
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
    const industry = document.getElementById('signup-industry').value;
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password')?.value;
    const agree    = document.getElementById('signup-agree')?.checked;
    
    const btn = e.target.querySelector('button[type="submit"]');

    if (!name || !industry || !email || !password || !confirmPassword) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    if (document.getElementById('signup-agree') && !agree) {
        showToast('You must agree to the Terms of Service', 'error');
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin 0.8s linear infinite;">refresh</span> Creating...`;
    btn.disabled = true;

    try {
        const response = await API.register({ fullName: name, email, password, industry });
        
        if (response.user) {
            window.currentUser = response.user;
            showToast('Account created securely! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'onboarding.html';
            }, 1500);
        } else {
            showToast(response.message || 'Verification link sent to email.', 'success');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }

    } catch (err) {
        showToast(err.message || 'Error creating account', 'error');
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
        showToast('Please enter your email address', 'error');
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin 0.8s linear infinite;">refresh</span> Sending...`;
    btn.disabled = true;

    try {
        const response = await API.requestPasswordReset(email);
        
        // Since we don't have a real email server, we will alert the simulated token directly
        // In a real app, this would just say "Check your email!"
        showToast(`Reset link simulated! Redirecting...`, 'success');
        
        // Pass the token to the reset page for this demo
        setTimeout(() => {
            window.location.href = `reset-password.html${response.resetToken ? '?token=' + response.resetToken : ''}`;
        }, 2000);

    } catch (err) {
        showToast('Error requesting password reset', 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    
    // Extract token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
        showToast('Invalid or missing reset token', 'error');
        return;
    }

    const password = document.getElementById('reset-password').value;
    const confirmPassword = document.getElementById('reset-confirm-password').value;
    const btn = document.getElementById('reset-btn');

    if (!password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin 0.8s linear infinite;">refresh</span> Resetting...`;
    btn.disabled = true;

    try {
        await API.resetPassword(token, password);
        showToast('Password reset successfully! Redirecting to login...', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    } catch (err) {
        showToast(err.message || 'Failed to reset password', 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

/* ==========================================================================
   SESSION GUARD
   ========================================================================== */

function checkSession() {
    const publicPages = ['login.html', 'signup.html', 'index.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (!window.currentUser && !publicPages.some(p => currentPage.includes(p))) {
        window.location.href = 'login.html';
    }
}
window.checkSession = checkSession;
