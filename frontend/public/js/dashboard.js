/* ==========================================================================
   GIGFLOW - DASHBOARD BUSINESS LOGIC (dashboard.js)
   ========================================================================= */

document.addEventListener('DOMContentLoaded', async () => {
    // Safeguard
    if (!window.currentUser && typeof checkActiveSession === 'function') {
        await checkActiveSession();
    }

    loadDashboardStats();
    loadDashboardLists();
    calculateProfileCompletion();
});

async function loadDashboardStats() {
    try {
        const res = await API.getAnalytics();
        const analytics = res.analytics;
        
        const appsCountEl = document.getElementById('stat-active');
        if (appsCountEl) appsCountEl.textContent = analytics.applications_count || 0;

        const savedRes = await API.getSavedJobs();
        const savedJobsEl = document.getElementById('stat-saved');
        if (savedJobsEl) savedJobsEl.textContent = savedRes.jobs ? savedRes.jobs.length : 0;

        const atsScoreEl = document.getElementById('stat-ats');
        if (atsScoreEl) atsScoreEl.textContent = analytics.skills_match_ratio ? `${Math.round(analytics.skills_match_ratio)}%` : '--';
        
        const interviewsCountEl = document.getElementById('stat-interviews');
        if (interviewsCountEl) interviewsCountEl.textContent = '0'; // placeholder or query
    } catch (e) {
        console.error('Failed to load dashboard stats', e);
    }
}

async function loadDashboardLists() {
    const recentAppsContainer = document.getElementById('dashboard-recent-applications');
    const recommendedJobsContainer = document.getElementById('dashboard-recommended-jobs');

    // Render Recent Applications
    if (recentAppsContainer) {
        try {
            const res = await API.getApplications();
            const apps = res.applications || [];
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
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--surface-low); border-radius: 12px; transition: var(--transition); margin-bottom: 8px;">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="width: 42px; height: 42px; background-color: var(--surface-container-high); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary);">
                                    ${app.company_name ? app.company_name.substring(0,2).toUpperCase() : 'GF'}
                                </div>
                                <div>
                                    <h4 style="font-size: 0.95rem; margin-bottom: 2px;">${app.job_title}</h4>
                                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0;">${app.company_name} &bull; ${new Date(app.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span class="badge ${badgeClass}">${app.status}</span>
                        </div>
                    `;
                });
            }
        } catch (e) {
            console.error('Failed to load applications list', e);
        }
    }

    // Render Recommended Jobs
    if (recommendedJobsContainer) {
        try {
            const res = await API.getRecommendedJobs();
            const recJobs = res.jobs || [];
            recommendedJobsContainer.innerHTML = '';
            
            if (recJobs.length === 0) {
                recommendedJobsContainer.innerHTML = `
                    <div style="padding: 16px; text-align: center; color: var(--text-muted);">
                        No recommendations matching your industry yet.
                    </div>
                `;
            } else {
                recJobs.slice(0, 2).forEach(job => {
                    recommendedJobsContainer.innerHTML += `
                        <div style="padding: 16px; border: 1px solid var(--border-color); border-radius: 12px; background: var(--surface); margin-bottom: 8px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <h4 style="font-size: 1rem; margin-bottom: 4px;">${job.title}</h4>
                                <span style="color: #10b981; font-weight: 800; font-size: 0.85rem;">Industry Match</span>
                            </div>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">${job.company_name} &bull; ${job.salary_range || 'Competitive'}</p>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-outline w-full" style="padding: 6px; font-size: 0.8rem;" onclick="location.href='job-details.html?id=${job.id}'">View</button>
                                <button class="btn btn-primary w-full" style="padding: 6px; font-size: 0.8rem;" onclick="location.href='apply.html?id=${job.id}'">Quick Apply</button>
                            </div>
                        </div>
                    `;
                });
            }
        } catch (e) {
            console.error('Failed to load recommended jobs', e);
        }
    }
}

function calculateProfileCompletion() {
    const profile = window.currentUser;
    let completion = 20; // Default baseline for having an account

    if (profile) {
        if (profile.full_name) completion += 20;
        if (profile.experience_level) completion += 15;
        if (profile.industry) completion += 15;
        if (profile.skills && profile.skills.length > 0) completion += 15;
        if (profile.resume_url) completion += 15;
    }

    const ring = document.querySelector('.progress-ring-circle');
    const textDiv = document.querySelector('svg + div');

    if (ring && textDiv) {
        const circumference = 339.292;
        const offset = circumference - (Math.min(completion, 100) / 100) * circumference;
        ring.style.strokeDashoffset = offset;
        textDiv.textContent = `${Math.min(completion, 100)}%`;
    }
}
