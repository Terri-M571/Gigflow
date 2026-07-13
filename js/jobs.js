/* ==========================================================================
   GIGFLOW - JOBS BOARD MANAGEMENT & FILTERS (jobs.js)
   ========================================================================== */

let currentJobs = [];
let filteredJobs = [];

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on details page or listing page
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('id');

    currentJobs = StorageManager.get(STORAGE_KEYS.JOBS) || [];
    filteredJobs = [...currentJobs];

    if (jobId) {
        loadJobDetails(jobId);
    } else {
        renderJobList();
        setupFilters();
    }
});

function renderJobList() {
    const container = document.getElementById('jobs-board-list');
    if (!container) return;

    container.innerHTML = '';
    if (filteredJobs.length === 0) {
        container.innerHTML = `
            <div class="text-center p-5" style="grid-column: span 2; color: var(--text-muted);">
                <span class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 12px;">search_off</span>
                <h3>No jobs match your search</h3>
                <p>Try expanding your keywords or relaxing filters.</p>
            </div>
        `;
        return;
    }

    filteredJobs.forEach(job => {
        container.innerHTML += `
            <div class="card hover-lift fade-in" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div class="flex-between" style="margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="${job.logo}" alt="${job.company}" style="width: 48px; height: 48px; border-radius: var(--border-radius); object-fit: contain; background: var(--surface-low); padding: 4px;">
                            <div>
                                <h3 style="font-size: 1.1rem; margin-bottom: 2px;">${job.title}</h3>
                                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0;">${job.company} &bull; ${job.location}</p>
                            </div>
                        </div>
                        <button class="btn btn-ghost btn-icon" onclick="bookmarkJob('${job.id}')" aria-label="Bookmark Job">
                            <span class="material-symbols-outlined">bookmark</span>
                        </button>
                    </div>
                    <p style="font-size: 0.9rem; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 16px;">
                        ${job.description}
                    </p>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                        ${job.skills.map(skill => `<span class="badge badge-primary">${skill}</span>`).join('')}
                        <span class="badge" style="background-color: var(--surface-low); color: var(--text-color);">${job.type}</span>
                    </div>
                </div>
                <div class="flex-between" style="border-top: 1px solid var(--border-color); padding-top: 16px; font-weight: 700; margin-top: auto;">
                    <div>
                        <span style="font-size: 1.1rem;">${job.salary}</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted); display: block; font-weight: 500;">Est. Salary</span>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <a href="job-details.html?id=${job.id}" class="btn btn-outline" style="padding: 8px 14px;">Details</a>
                        <button class="btn btn-primary" onclick="quickApply('${job.id}')">Apply</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function setupFilters() {
    const searchInput = document.getElementById('job-search-input');
    const locationInput = document.getElementById('job-location-input');
    const remoteToggle = document.getElementById('remote-only-toggle');

    if (!searchInput) return;

    const filterAction = () => {
        const query = searchInput.value.toLowerCase();
        const locationQuery = locationInput ? locationInput.value.toLowerCase() : '';
        const remoteOnly = remoteToggle ? remoteToggle.checked : false;

        // Checkbox inputs
        const selectedTypes = Array.from(document.querySelectorAll('input[name="job-type"]:checked')).map(el => el.value.toLowerCase());
        const selectedExp = Array.from(document.querySelectorAll('input[name="experience"]:checked')).map(el => el.value.toLowerCase());

        filteredJobs = currentJobs.filter(job => {
            const matchesQuery = job.title.toLowerCase().includes(query) || 
                                 job.company.toLowerCase().includes(query) || 
                                 job.skills.some(s => s.toLowerCase().includes(query));
            
            const matchesLocation = !locationQuery || job.location.toLowerCase().includes(locationQuery);
            
            const matchesRemote = !remoteOnly || job.location.toLowerCase().includes('remote');
            
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(job.type.toLowerCase());
            
            // Basic experience match heuristic
            const matchesExp = selectedExp.length === 0 || selectedExp.some(exp => job.experience.toLowerCase().includes(exp));

            return matchesQuery && matchesLocation && matchesRemote && matchesType && matchesExp;
        });

        renderJobList();
    };

    searchInput.addEventListener('input', filterAction);
    if (locationInput) locationInput.addEventListener('input', filterAction);
    if (remoteToggle) remoteToggle.addEventListener('change', filterAction);

    document.querySelectorAll('input[name="job-type"], input[name="experience"]').forEach(chk => {
        chk.addEventListener('change', filterAction);
    });
}

function loadJobDetails(id) {
    const job = currentJobs.find(j => j.id === id);
    if (!job) return;

    document.getElementById('job-details-title').textContent = job.title;
    document.getElementById('job-details-company').textContent = job.company;
    document.getElementById('job-details-logo').src = job.logo;
    document.getElementById('job-details-location').textContent = job.location;
    document.getElementById('job-details-type').textContent = job.type;
    document.getElementById('job-details-salary').textContent = job.salary;
    document.getElementById('job-details-experience').textContent = job.experience;
    document.getElementById('job-details-description').textContent = job.description;

    const skillsContainer = document.getElementById('job-details-skills');
    if (skillsContainer) {
        skillsContainer.innerHTML = job.skills.map(s => `<span class="badge badge-primary">${s}</span>`).join('');
    }

    const applyBtn = document.getElementById('job-details-apply-btn');
    if (applyBtn) {
        applyBtn.onclick = () => quickApply(job.id);
    }
}

function quickApply(jobId) {
    const job = currentJobs.find(j => j.id === jobId);
    if (!job) return;

    let apps = StorageManager.get(STORAGE_KEYS.APPLICATIONS) || [];
    if (apps.find(a => a.id === `app-custom-${jobId}`)) {
        showToast('You have already applied for this job!', 'info');
        return;
    }

    const newApp = {
        id: `app-custom-${jobId}`,
        title: job.title,
        company: job.company,
        logo: job.company.substring(0, 2).toUpperCase(),
        location: job.location,
        date: 'Applied today',
        status: 'applied'
    };

    apps.push(newApp);
    StorageManager.set(STORAGE_KEYS.APPLICATIONS, apps);
    showToast(`Application submitted to ${job.company}!`, 'success');
}
window.quickApply = quickApply;
