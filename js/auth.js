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

    const session = StorageManager.get(STORAGE_KEYS.USER_SESSION);
    const name = session?.name || session?.email?.split('@')[0] || 'there';
    el.textContent = buildGreeting(name);
}

// Expose globally
window.buildGreeting  = buildGreeting;
window.getFirstName   = getFirstName;
window.getTimeGreeting = getTimeGreeting;
window.getGreetingEmoji = getGreetingEmoji;
window.injectGreeting = injectGreeting;

/* ==========================================================================
   LOGIN HANDLER
   ========================================================================== */

function handleLogin(e) {
    e.preventDefault();

    // Support both old login.html (login-email/login-password)
    // and new redesigned login.html which has the same IDs.
    const emailEl    = document.getElementById('login-email');
    const passwordEl = document.getElementById('login-password');
    const rememberEl = document.getElementById('login-remember') || document.getElementById('remember-me');

    if (!emailEl || !passwordEl) return;

    const email    = emailEl.value.trim();
    const password = passwordEl.value;

    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Retrieve registered users from storage
    const users = StorageManager.get(STORAGE_KEYS.USERS) || [];
    const matchedUser = users.find(u => u.email === email && u.password === password);

    // Demo account fallback
    const isDemoLogin = (email === 'alex@gigflow.ai' && password === 'Password123!');

    if (matchedUser || isDemoLogin) {
        const sessionUser = matchedUser || { name: 'Alex Rivera', email: 'alex@gigflow.ai' };

        // Store session with name so greeting can use it everywhere
        StorageManager.set(STORAGE_KEYS.USER_SESSION, {
            name:      sessionUser.name,
            email:     sessionUser.email,
            loggedIn:  true,
            loginTime: new Date().toISOString()
        });

        const greeting = buildGreeting(sessionUser.name);
        showToast(`${greeting} Welcome back! 🎉`, 'success');

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1300);
    } else {
        showToast('Invalid email or password combination', 'error');
    }
}

/* ==========================================================================
   SIGNUP HANDLER
   ========================================================================== */

function handleSignup(e) {
    e.preventDefault();
    const name     = document.getElementById('signup-name').value.trim();
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const agree    = document.getElementById('signup-agree')?.checked;

    if (!name || !email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (!agree) {
        showToast('You must agree to the Terms of Service', 'error');
        return;
    }

    if (password.length < 8) {
        showToast('Password must be at least 8 characters long', 'error');
        return;
    }

    const users = StorageManager.get(STORAGE_KEYS.USERS) || [];
    if (users.find(u => u.email === email)) {
        showToast('An account with this email already exists', 'error');
        return;
    }

    // Save user
    const newUser = { name, email, password };
    users.push(newUser);
    StorageManager.set(STORAGE_KEYS.USERS, users);

    // Write initial profile
    const initialProfile = {
        name:         name,
        bio:          'AI career builder profile',
        avatar:       'https://lh3.googleusercontent.com/aida-public/AB6AXuD-McpRx1yuPgxpS_tSkdJjKZMG-X5msmkvOtILPl13aDd2lNepRmLbNOobLhbi1AYCMWbc57IhcEmukqKRgiM8ijGIOGmkiLAsJv0oYKPWGC-gDfxLPOPVgnUAWhhsfVkCiKDWoGJ92c2CGgCq1ETxr0aF7nMWCt3ANb_Qzo_H7CXJ28MYKnYxNK3k4GiKCTraUl-nVfEde7XG8S7zlVay7NoOK0-UE-ztcWex86oqL4PWJs6POxKp',
        skills:       ['Figma', 'HTML5', 'CSS3', 'JavaScript'],
        experience:   'Not set yet',
        education:    'Not set yet',
        languages:    'English',
        links:        '',
        availability: 'Available'
    };
    StorageManager.set('gigflow_profile', initialProfile);

    // Set session with name
    StorageManager.set(STORAGE_KEYS.USER_SESSION, {
        name:      name,
        email:     email,
        loggedIn:  true,
        loginTime: new Date().toISOString()
    });

    const greeting = buildGreeting(name);
    showToast(`${greeting} Your account is ready! 🚀`, 'success');

    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1300);
}

/* ==========================================================================
   FORGOT PASSWORD HANDLER
   ========================================================================== */

function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();
    if (!email) {
        showToast('Please enter your email address', 'error');
        return;
    }
    showToast(`Password recovery link simulated to ${email}`, 'success');
}

/* ==========================================================================
   SESSION GUARD
   ========================================================================== */

function checkSession() {
    const session = StorageManager.get(STORAGE_KEYS.USER_SESSION);
    const publicPages = ['login.html', 'signup.html', 'index.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (!session?.loggedIn && !publicPages.some(p => currentPage.includes(p))) {
        window.location.href = 'login.html';
    }
}
window.checkSession = checkSession;
