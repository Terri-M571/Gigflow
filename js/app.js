/* ==========================================================================
   GIGFLOW - GLOBAL APP CONTROLLER & LAYOUT INJECTOR (app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 0. Enforce Auth
    enforceAuthGuard();

    // 1. Initialize Theme (Light / Dark Mode)
    initTheme();

    // 2. Inject Shared Layout Elements (Navbar, Sidebar, Footer)
    injectLayouts();

    // 3. Setup Layout Interactions (collapsible sidebar, active links, profile menu dropdown)
    setupLayoutInteractions();
});

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem('gigflow_theme') || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
        html.className = 'dark';
        localStorage.setItem('gigflow_theme', 'dark');
    } else {
        html.className = 'light';
        localStorage.setItem('gigflow_theme', 'light');
    }
    // Update any theme toggler button icon in the view
    const themeIcons = document.querySelectorAll('.theme-toggle-btn span');
    themeIcons.forEach(icon => {
        icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    });
}

function toggleTheme() {
    const currentTheme = document.documentElement.className === 'dark' ? 'dark' : 'light';
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    showToast(`Switched to ${document.documentElement.className === 'dark' ? 'Dark' : 'Light'} Mode`, 'success');
}

/* ============================================================
   AUTH GUARD — Checks whether the user is logged in.
   Protected links redirect to login.html with a return URL
   so the user is sent back after successfully logging in.
   ============================================================ */
function isLoggedIn() {
    try {
        const session = JSON.parse(localStorage.getItem('gigflow_user_session') || 'null');
        return !!(session && session.loggedIn);
    } catch (_) {
        return false;
    }
}

/**
 * Page Load Auth Guard:
 * Redirects immediately if a user tries to access a protected page without logging in.
 */
function enforceAuthGuard() {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const publicPages = ['index.html', 'login.html', 'signup.html', 'pricing.html', ''];
    
    if (!publicPages.includes(currentFile) && !isLoggedIn()) {
        sessionStorage.setItem('gigflow_redirect_after_login', currentFile);
        window.location.href = 'login.html';
    }
}

/**
 * Handle user logout globally.
 */
function handleLogout(e) {
    if (e) e.preventDefault();
    localStorage.removeItem('gigflow_user_session');
    // We don't remove gigflow_users array, just the active session
    showToast('Logging out...', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}
window.handleLogout = handleLogout;

/**
 * Intercepts a click on a protected nav link.
 * If not logged in → redirect to login.html, storing the intended destination
 * so the login page can bounce the user back after auth.
 */
function guardedNavigate(e, destination) {
    if (!isLoggedIn()) {
        e.preventDefault();
        // Save intended destination for post-login redirect
        sessionStorage.setItem('gigflow_redirect_after_login', destination);
        showToast('Please log in to access this page 🔒', 'info');
        setTimeout(() => { window.location.href = 'login.html'; }, 600);
    }
    // If logged in, let the default href navigate normally
}

// --- Layout Injector ---
function injectLayouts() {
    const navbarPlaceholder  = document.getElementById('navbar-placeholder');
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
    const footerPlaceholder  = document.getElementById('footer-placeholder');

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    const loggedIn    = isLoggedIn();
    // Landing page is always public — never show lock icons there
    const isLandingPage = (currentFile === 'index.html' || currentFile === '');

    // Helper: build a nav link — protected ones show a subtle lock on inner pages when logged out
    function navLink(href, label, extraActive) {
        const isActive = currentFile === href || (extraActive && extraActive.includes(currentFile));
        const isProtected = !isLandingPage && !loggedIn && href !== 'index.html';
        return `<a href="${href}"
               class="navbar-link${isActive ? ' active' : ''}${isProtected ? ' nav-protected' : ''}"
               ${isProtected ? `data-dest="${href}"` : ''}>
               ${label}${isProtected ? '<span class="nav-lock-icon material-symbols-outlined">lock</span>' : ''}
           </a>`;
    }


    if (navbarPlaceholder) {
        navbarPlaceholder.innerHTML = `
            <nav class="navbar">
                <div class="navbar-container">
                    <a href="index.html" class="navbar-brand">
                        <img src="assets/logo/logo.png" alt="GigFlow Logo" class="navbar-logo">
                    </a>
                    <div class="navbar-menu">
                        ${navLink('index.html',         'Home')}
                        ${navLink('jobs.html',           'Jobs',           ['job-details.html'])}
                        ${navLink('freelance.html',      'Freelance',      ['project-details.html'])}
                        ${navLink('resume-builder.html', 'Resume Builder')}
                        ${navLink('learning.html',       'Learning Hub')}
                    </div>
                    <div class="navbar-actions">
                        <button class="btn btn-ghost btn-icon theme-toggle-btn" onclick="toggleTheme()" aria-label="Toggle Dark Mode">
                            <span class="material-symbols-outlined">dark_mode</span>
                        </button>
                        <button class="btn btn-ghost btn-icon" id="mobile-sidebar-toggle" aria-label="Open Sidebar Menu">
                            <span class="material-symbols-outlined">menu</span>
                        </button>
                        <button class="btn btn-ghost btn-icon" onclick="showToast('No new notifications', 'info')">
                            <span class="material-symbols-outlined">notifications</span>
                        </button>
                        ${loggedIn
                            ? `<div class="user-menu-trigger" onclick="location.href='profile.html'" title="View Profile">
                                   <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-McpRx1yuPgxpS_tSkdJjKZMG-X5msmkvOtILPl13aDd2lNepRmLbNOobLhbi1AYCMWbc57IhcEmukqKRgiM8ijGIOGmkiLAsJv0oYKPWGC-gDfxLPOPVgnUAWhhsfVkCiKDWoGJ92c2CGgCq1ETxr0aF7nMWCt3ANb_Qzo_H7CXJ28MYKnYxNK3k4GiKCTraUl-nVfEde7XG8S7zlVay7NoOK0-UE-ztcWex86oqL4PWJs6POxKp"
                                        alt="User Profile" class="user-avatar" id="global-navbar-avatar">
                               </div>`
                            : `<a href="login.html" class="btn btn-ghost" style="height:36px;padding:0 14px;font-size:0.85rem;font-weight:600;">Log In</a>
                               <a href="signup.html" class="btn btn-primary" style="height:36px;padding:0 14px;font-size:0.85rem;">Get Started Free</a>`
                        }
                    </div>
                </div>
            </nav>
        `;

        // Attach auth-guard ONLY on inner pages when logged out
        if (!isLandingPage && !loggedIn) {
            document.querySelectorAll('.nav-protected').forEach(link => {
                link.addEventListener('click', function(e) {
                    guardedNavigate(e, this.dataset.dest);
                });
            });
        }
    }



    // Sidebar Template (Dashboard app shell pages)
    if (sidebarPlaceholder) {
        sidebarPlaceholder.innerHTML = `
            <aside class="sidebar" id="global-sidebar">
                <div class="sidebar-brand-section">
                    <h2 class="sidebar-title">GigFlow App</h2>
                    <p class="sidebar-subtitle">Navigation Hub</p>
                </div>
                <nav class="sidebar-menu">
                    <span class="sidebar-group-title">Main</span>
                    <a href="dashboard.html" class="sidebar-link ${currentFile === 'dashboard.html' ? 'active' : ''}">
                        <span class="material-symbols-outlined">dashboard</span>
                        <span>Dashboard</span>
                    </a>
                    <a href="jobs.html" class="sidebar-link ${currentFile === 'jobs.html' || currentFile === 'job-details.html' ? 'active' : ''}">
                        <span class="material-symbols-outlined">search</span>
                        <span>Job Search</span>
                    </a>
                    <a href="#" class="sidebar-link">
                        <span class="material-symbols-outlined">bookmark</span>
                        <span>Saved Jobs</span>
                    </a>
                    <a href="application-tracker.html" class="sidebar-link ${currentFile === 'application-tracker.html' ? 'active' : ''}">
                        <span class="material-symbols-outlined">assignment_turned_in</span>
                        <span>Applications</span>
                    </a>

                    <span class="sidebar-group-title">AI Tools</span>
                    <a href="resume-builder.html" class="sidebar-link ${currentFile === 'resume-builder.html' ? 'active' : ''}">
                        <span class="material-symbols-outlined">edit_note</span>
                        <span>Resume Builder</span>
                    </a>
                    <a href="cover-letter.html" class="sidebar-link ${currentFile === 'cover-letter.html' ? 'active' : ''}">
                        <span class="material-symbols-outlined">description</span>
                        <span>Cover Letter Generator</span>
                    </a>
                    <a href="interview-prep.html" class="sidebar-link ${currentFile === 'interview-prep.html' || currentFile === 'ai-interview.html' ? 'active' : ''}">
                        <span class="material-symbols-outlined">psychology</span>
                        <span>Interview Coach</span>
                    </a>
                    <a href="learning.html" class="sidebar-link ${currentFile === 'learning.html' ? 'active' : ''}">
                        <span class="material-symbols-outlined">school</span>
                        <span>Career Roadmap</span>
                    </a>
                    <a href="portfolio.html" class="sidebar-link ${currentFile === 'portfolio.html' ? 'active' : ''}">
                        <span class="material-symbols-outlined">folder_shared</span>
                        <span>Portfolio Review</span>
                    </a>

                    <span class="sidebar-group-title">Account</span>
                    <a href="profile.html" class="sidebar-link ${currentFile === 'profile.html' ? 'active' : ''}">
                        <span class="material-symbols-outlined">person</span>
                        <span>Profile</span>
                    </a>
                    <a href="pricing.html" class="sidebar-link ${currentFile === 'pricing.html' ? 'active' : ''}">
                        <span class="material-symbols-outlined">workspace_premium</span>
                        <span>Subscription</span>
                    </a>
                    <a href="settings.html" class="sidebar-link ${currentFile === 'settings.html' ? 'active' : ''}">
                        <span class="material-symbols-outlined">settings</span>
                        <span>Settings</span>
                    </a>
                    <a href="#" onclick="handleLogout(event)" class="sidebar-link" style="color: var(--error);">
                        <span class="material-symbols-outlined">logout</span>
                        <span>Logout</span>
                    </a>
                </nav>
            </aside>
        `;
    }

    // Footer Template
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = `
            <footer style="background-color: var(--surface-container-highest); border-top: 1px solid var(--border-color); padding: 48px 24px 24px; margin-top: auto; font-size: 0.9rem;">
                <div class="container" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px;">
                    <div>
                        <img src="assets/logo/logo.png" alt="GigFlow Logo" style="height: 38px; margin-bottom: 16px;">
                        <p style="color: var(--text-muted); max-width: 320px;">AI-powered career ecosystem combining job searching, freelancing, resume builders, and coaching into one flow.</p>
                    </div>
                    <div>
                        <h4 style="font-size: 1rem; margin-bottom: 16px;">Core Platform</h4>
                        <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
                            <li><a href="jobs.html" style="color: var(--text-muted);">Jobs Board</a></li>
                            <li><a href="freelance.html" style="color: var(--text-muted);">Freelance Marketplace</a></li>
                            <li><a href="learning.html" style="color: var(--text-muted);">Learning Paths</a></li>
                            <li><a href="live-coach.html" style="color: var(--text-muted);">Career Coaches</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="font-size: 1rem; margin-bottom: 16px;">AI Toolbox</h4>
                        <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
                            <li><a href="ats-checker.html" style="color: var(--text-muted);">ATS Keyword Review</a></li>
                            <li><a href="resume-builder.html" style="color: var(--text-muted);">AI Resume Builder</a></li>
                            <li><a href="cover-letter.html" style="color: var(--text-muted);">AI Cover Letters</a></li>
                            <li><a href="interview-prep.html" style="color: var(--text-muted);">Mock Interview Engine</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="font-size: 1rem; margin-bottom: 16px;">Company</h4>
                        <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
                            <li><a href="#" style="color: var(--text-muted);">About Us</a></li>
                            <li><a href="#" style="color: var(--text-muted);">Privacy Standards</a></li>
                            <li><a href="#" style="color: var(--text-muted);">User Terms</a></li>
                            <li><a href="#" style="color: var(--text-muted);">Contact Support</a></li>
                        </ul>
                    </div>
                </div>
                <div class="container" style="border-top: 1px solid var(--border-color); padding-top: 20px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
                    &copy; 2026 GigFlow Inc. All rights reserved. 🇰🇪 Made in Kenya.
                </div>
            </footer>
        `;
    }
}

// --- Layout Interactions & Responsive ---
function setupLayoutInteractions() {
    const toggleBtn = document.getElementById('mobile-sidebar-toggle');
    const sidebar   = document.getElementById('global-sidebar');

    if (sidebar) {
        // Show menu button on small screens
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('mobile-open');
            });
        }

        // Close sidebar if user clicks outside of it on mobile
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('mobile-open') && !sidebar.contains(e.target) && e.target !== toggleBtn) {
                sidebar.classList.remove('mobile-open');
            }
        });
    }

    // Load custom base64 avatar if saved in LocalStorage
    const savedProfile = localStorage.getItem('gigflow_profile');
    if (savedProfile) {
        try {
            const profile = JSON.parse(savedProfile);
            if (profile.avatar) {
                const navAvatars = document.querySelectorAll('.user-avatar');
                navAvatars.forEach(av => {
                    av.src = profile.avatar;
                });
            }
        } catch (e) {
            console.error("Error loading avatar header:", e);
        }
    }

    // Post-login redirect: if we stored a destination, go there now
    const redirectDest = sessionStorage.getItem('gigflow_redirect_after_login');
    if (redirectDest && isLoggedIn()) {
        sessionStorage.removeItem('gigflow_redirect_after_login');
        // Only redirect if we are on login/signup page
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'login.html' || currentPage === 'signup.html') {
            window.location.href = redirectDest;
        }
    }
}

// --- Toast Notifications System ---
function showToast(message, type = 'info') {
    // Remove existing toast if visible
    const existing = document.querySelector('.toast');
    if (existing) {
        existing.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'info';
    if (type === 'success') icon = 'check_circle';
    if (type === 'error')   icon = 'error';

    toast.innerHTML = `
        <span class="material-symbols-outlined">${icon}</span>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Slide out and remove after 3s
    setTimeout(() => {
        toast.classList.add('dismiss');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}
window.showToast   = showToast;
window.toggleTheme = toggleTheme;
window.isLoggedIn  = isLoggedIn;
