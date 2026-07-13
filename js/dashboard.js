/* ==========================================================================
   GIGFLOW - DASHBOARD BUSINESS LOGIC (dashboard.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Session Safeguard
    if (typeof checkSession === 'function') checkSession();

    loadDashboardStats();
    loadDashboardLists();
    calculateProfileCompletion();
});

function loadDashboardStats() {
    const apps = StorageManager.get(STORAGE_KEYS.APPLICATIONS) || [];
    const jobs = StorageManager.get(STORAGE_KEYS.JOBS) || [];

    // Applications Count
    const activeApps = apps.filter(a => a.status === 'applied' || a.status === 'interview').length;
    const appsCountEl = document.getElementById('stat-active-applications');
    if (appsCountEl) appsCountEl.textContent = activeApps;

    // Upcoming Interviews Count
    const interviewsCount = apps.filter(a => a.status === 'interview').length;
    const interviewsCountEl = document.getElementById('stat-upcoming-interviews');
    if (interviewsCountEl) interviewsCountEl.textContent = interviewsCount;

    // Profile Views Mock
    const viewsEl = document.getElementById('stat-profile-views');
    if (viewsEl) viewsEl.textContent = '1.4k';

    // Career Score Mock
    const scoreEl = document.getElementById('stat-career-score');
    if (scoreEl) scoreEl.textContent = '945';
}

function calculateProfileCompletion() {
    const savedProfile = localStorage.getItem('gigflow_profile');
    let completion = 40; // Default baseline

    if (savedProfile) {
        try {
            const profile = JSON.parse(savedProfile);
            if (profile.name) completion += 10;
            if (profile.bio && profile.bio !== 'AI career builder profile') completion += 10;
            if (profile.skills && profile.skills.length > 0) completion += 10;
            if (profile.experience && profile.experience !== 'Not set yet') completion += 10;
            if (profile.education && profile.education !== 'Not set yet') completion += 10;
            if (profile.avatar && !profile.avatar.includes('AB6AXuD-Mcp')) completion += 10; // customized photo
        } catch (e) {
            console.error("Error evaluating profile score:", e);
        }
    }

    const progressFill = document.getElementById('dashboard-profile-progress-fill');
    const progressText = document.getElementById('dashboard-profile-progress-text');
    const welcomeUserText = document.getElementById('dashboard-welcome-username');

    if (progressFill) progressFill.style.width = `${completion}%`;
    if (progressText) progressText.textContent = `${completion}%`;

    const userSession = StorageManager.get(STORAGE_KEYS.USER_SESSION);
    if (welcomeUserText && userSession) {
        welcomeUserText.textContent = `Good Morning, ${userSession.name || 'Alex'}!`;
    }
}

function loadDashboardLists() {
    const recentAppsContainer = document.getElementById('dashboard-recent-applications');
    const recommendedJobsContainer = document.getElementById('dashboard-recommended-jobs');

    const apps = StorageManager.get(STORAGE_KEYS.APPLICATIONS) || [];
    const jobs = StorageManager.get(STORAGE_KEYS.JOBS) || [];

    // Render Recent Applications
    if (recentAppsContainer) {
        recentAppsContainer.innerHTML = '';
        if (apps.length === 0) {
            recentAppsContainer.innerHTML = `<div class="text-center p-4 text-muted">No applications sent recently. Explore the Job Board!</div>`;
        } else {
            apps.slice(0, 3).forEach(app => {
                let badgeClass = 'badge-primary';
                if (app.status === 'interview') badgeClass = 'badge-secondary';
                if (app.status === 'rejected') badgeClass = 'badge-error';
                if (app.status === 'offer') badgeClass = 'badge-success';

                recentAppsContainer.innerHTML += `
                    <div class="flex-between p-3 bg-light rounded mb-2 border border-transparent hover-border hover-lift" style="background-color: var(--surface-low); border-radius: var(--border-radius); transition: var(--transition-fast);">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div class="flex-center" style="width: 48px; height: 48px; background-color: var(--surface-container-high); border-radius: var(--border-radius); font-weight: 800; color: var(--primary);">
                                ${app.logo || app.company.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                                <h4 style="font-size: 0.95rem; margin-bottom: 2px;">${app.title}</h4>
                                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0;">${app.company} &bull; ${app.date || 'Just now'}</p>
                            </div>
                        </div>
                        <span class="badge ${badgeClass}">${app.status}</span>
                    </div>
                `;
            });
        }
    }

    // Render Recommended Jobs Carousel/Grid
    if (recommendedJobsContainer) {
        recommendedJobsContainer.innerHTML = '';
        jobs.slice(0, 2).forEach(job => {
            recommendedJobsContainer.innerHTML += `
                <div class="card hover-lift" style="min-width: 290px; flex-grow: 1; position: relative;">
                    <button class="btn btn-ghost btn-icon" style="position: absolute; top: 12px; right: 12px; color: var(--text-muted);" onclick="bookmarkJob('${job.id}')">
                        <span class="material-symbols-outlined">bookmark</span>
                    </button>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                        <img src="${job.logo}" alt="${job.company}" style="width: 44px; height: 44px; border-radius: var(--border-radius); object-fit: contain; background: var(--surface-low); padding: 4px;">
                        <div>
                            <h4 style="font-size: 0.95rem; margin-bottom: 2px;">${job.title}</h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0;">${job.company} &bull; ${job.location}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                        ${job.skills.slice(0,3).map(skill => `<span class="badge badge-primary">${skill}</span>`).join('')}
                    </div>
                    <div class="flex-between" style="border-top: 1px solid var(--border-color); padding-top: 12px; font-weight: 700; font-size: 0.9rem;">
                        <span>${job.salary}</span>
                        <a href="job-details.html?id=${job.id}" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem;">Apply</a>
                    </div>
                </div>
            `;
        });
    }
}

function bookmarkJob(jobId) {
    let bookmarks = StorageManager.get(STORAGE_KEYS.BOOKMARKS) || [];
    if (!bookmarks.includes(jobId)) {
        bookmarks.push(jobId);
        StorageManager.set(STORAGE_KEYS.BOOKMARKS, bookmarks);
        showToast('Job added to saved bookmarks!', 'success');
    } else {
        showToast('Job already bookmarked', 'info');
    }
}
window.bookmarkJob = bookmarkJob;
