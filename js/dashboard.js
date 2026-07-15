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
    const savedJobs = StorageManager.get(STORAGE_KEYS.SAVED_JOBS) || [];

    // Applications Count
    const activeApps = apps.filter(a => a.status === 'applied' || a.status === 'interview').length;
    const appsCountEl = document.getElementById('stat-active');
    if (appsCountEl) appsCountEl.textContent = activeApps;

    // Upcoming Interviews Count
    const interviewsCount = apps.filter(a => a.status === 'interview').length;
    const interviewsCountEl = document.getElementById('stat-interviews');
    if (interviewsCountEl) interviewsCountEl.textContent = interviewsCount;

    // Saved Jobs Count
    const savedJobsEl = document.getElementById('stat-saved');
    if (savedJobsEl) savedJobsEl.textContent = savedJobs.length;

    // ATS Mock Score
    const atsScoreEl = document.getElementById('stat-ats');
    if (atsScoreEl) atsScoreEl.textContent = activeApps > 0 ? '82%' : '--';
}

function calculateProfileCompletion() {
    const profileData = StorageManager.get('gigflow_profile');
    let completion = 20; // Default baseline for having an account

    if (profileData) {
        if (profileData.role) completion += 20;
        if (profileData.experience) completion += 15;
        if (profileData.industry) completion += 15;
        if (profileData.skills && profileData.skills.length > 0) completion += 15;
        // The last 15% is for portfolio link
        if (profileData.portfolio && profileData.portfolio.trim() !== '') completion += 15;
    }

    // Target the SVG ring and the text inside it
    const ring = document.querySelector('.progress-ring-circle');
    const textDiv = document.querySelector('svg + div');

    if (ring && textDiv) {
        // Circumference calculation for r=54: 2 * pi * 54 = 339.292
        const circumference = 339.292;
        const offset = circumference - (completion / 100) * circumference;
        ring.style.strokeDashoffset = offset;
        textDiv.textContent = `${completion}%`;
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
            recentAppsContainer.innerHTML = `
                <div style="padding: 24px; text-align: center; color: var(--text-muted); background: var(--surface-low); border-radius: 12px; border: 1px dashed var(--border-color);">
                    <span class="material-symbols-outlined" style="font-size: 32px; margin-bottom: 8px; opacity: 0.5;">assignment</span><br>
                    No applications yet.<br>
                    <button class="btn btn-primary btn-sm mt-3" onclick="location.href='jobs.html'">Find Jobs</button>
                </div>
            `;
        } else {
            apps.slice(0, 3).forEach(app => {
                let badgeClass = 'badge-primary';
                if (app.status === 'interview') badgeClass = 'badge-secondary';
                if (app.status === 'rejected') badgeClass = 'badge-error';
                if (app.status === 'offer') badgeClass = 'badge-success';

                recentAppsContainer.innerHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--surface-low); border-radius: 12px; transition: var(--transition);">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="width: 42px; height: 42px; background-color: var(--surface-container-high); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary);">
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

    // Render Recommended Jobs (Mock)
    if (recommendedJobsContainer) {
        recommendedJobsContainer.innerHTML = '';
        
        const mockJobs = [
            { title: 'Senior UX Designer', company: 'Stripe', salary: '$140k - $180k', match: '96%' },
            { title: 'Product Manager', company: 'Notion', salary: '$130k - $160k', match: '92%' }
        ];

        mockJobs.forEach(job => {
            recommendedJobsContainer.innerHTML += `
                <div style="padding: 16px; border: 1px solid var(--border-color); border-radius: 12px; background: var(--surface);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <h4 style="font-size: 1rem; margin-bottom: 4px;">${job.title}</h4>
                        <span style="color: #10b981; font-weight: 800; font-size: 0.85rem;">${job.match} Match</span>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">${job.company} &bull; ${job.salary}</p>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-outline w-full" style="padding: 6px; font-size: 0.8rem;">View</button>
                        <button class="btn btn-primary w-full" style="padding: 6px; font-size: 0.8rem;">Quick Apply</button>
                    </div>
                </div>
            `;
        });
    }
}
