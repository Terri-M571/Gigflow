/* ==========================================================================
   GIGFLOW - LIVE GLOBAL JOBS BOARD (jobs.js)
   ========================================================================= */

let allJobs = [];
let filteredJobs = [];
let selectedJobId = null;
let savedJobIds = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Session check safeguard
    if (!window.currentUser && typeof checkActiveSession === 'function') {
        await checkActiveSession();
    }

    await loadSavedJobsList();
    await loadJobs();
    setupFilters();
});

async function loadSavedJobsList() {
    try {
        const res = await API.getSavedJobs();
        savedJobIds = (res.jobs || []).map(j => j.id);
    } catch (e) {
        console.error("Failed to load saved jobs index", e);
    }
}

async function loadJobs() {
    const listContainer = document.getElementById('job-list-container');
    if (listContainer) {
        listContainer.innerHTML = `
            <div style="padding: 32px; text-align: center; color: var(--text-muted);">
                <span class="material-symbols-outlined spinner" style="font-size: 32px; margin-bottom: 8px;">refresh</span>
                <p>Loading jobs from database...</p>
            </div>
        `;
    }

    try {
        // Check if query is looking for saved jobs only
        const urlParams = new URLSearchParams(window.location.search);
        let res;
        if (urlParams.get('saved') === 'true') {
            res = await API.getSavedJobs();
            const heading = document.querySelector('h1');
            if (heading) heading.textContent = 'Saved Jobs';
        } else {
            res = await API.getJobs();
        }

        allJobs = res.jobs || [];
        filteredJobs = [...allJobs];
        
        if (window.innerWidth > 1024 && filteredJobs.length > 0) {
            selectedJobId = filteredJobs[0].id;
        }
        
        renderJobList();
        if (selectedJobId) {
            renderJobDetails(selectedJobId);
        } else if (window.innerWidth > 1024) {
            showEmptyDetailsPane();
        }
    } catch (err) {
        console.error("Failed to load jobs:", err);
        if (listContainer) {
            listContainer.innerHTML = `
                <div style="padding: 32px; text-align: center; color: var(--error);">
                    <span class="material-symbols-outlined" style="font-size: 32px; margin-bottom: 8px;">error</span>
                    <p>Failed to retrieve jobs. Verify database connection.</p>
                </div>
            `;
        }
    }
}

function showEmptyDetailsPane() {
    const detailsContainer = document.getElementById('job-details-container');
    if (detailsContainer) {
        detailsContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); opacity: 0.6;">
                <span class="material-symbols-outlined" style="font-size: 64px; margin-bottom: 16px;">work</span>
                <h3 style="font-size: 1.2rem;">Select a job to view details</h3>
            </div>
        `;
    }
}

function renderJobList() {
    const listContainer = document.getElementById('job-list-container');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (filteredJobs.length === 0) {
        listContainer.innerHTML = `
            <div style="padding: 32px; text-align: center; color: var(--text-muted);">
                <span class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 16px;">search_off</span>
                <h4>No jobs found</h4>
                <p style="font-size: 0.9rem;">Try adjusting your filters or search terms.</p>
            </div>
        `;
        return;
    }

    filteredJobs.forEach(job => {
        const logoHtml = job.company_logo 
            ? `<img src="${job.company_logo}" alt="${job.company_name}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: contain; background: white;">`
            : `<div style="width: 40px; height: 40px; border-radius: 8px; background: var(--surface-container-high); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800;">${job.company_name ? job.company_name.substring(0,2).toUpperCase() : 'GF'}</div>`;

        const isSelected = job.id === selectedJobId ? 'selected' : '';

        const card = document.createElement('div');
        card.className = `job-card-compact ${isSelected}`;
        card.onclick = () => selectJob(job.id);
        
        card.innerHTML = `
            <div style="display: flex; gap: 16px;">
                ${logoHtml}
                <div style="flex: 1;">
                    <h4 style="font-size: 1rem; margin-bottom: 4px; line-height: 1.3;">${job.title}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">${job.company_name || 'Anonymous'} &bull; ${job.location || 'Remote'}</p>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span class="badge" style="background: var(--surface-low);">${job.type}</span>
                        ${job.is_remote ? `<span class="badge" style="background: var(--surface-low); color: var(--success);">Remote</span>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        listContainer.appendChild(card);
    });
}

function selectJob(id) {
    selectedJobId = id;
    document.querySelectorAll('.job-card-compact').forEach(card => card.classList.remove('selected'));
    renderJobList();
    renderJobDetails(id);

    if (window.innerWidth <= 1024) {
        document.getElementById('job-details-container').classList.add('active-mobile');
    }
}

function closeMobileDetails() {
    document.getElementById('job-details-container').classList.remove('active-mobile');
}

function renderJobDetails(id) {
    const detailsContainer = document.getElementById('job-details-container');
    if (!detailsContainer) return;

    const job = allJobs.find(j => j.id === id);
    if (!job) return;

    const logoHtml = job.company_logo 
        ? `<img src="${job.company_logo}" alt="${job.company_name}" style="width: 64px; height: 64px; border-radius: 12px; object-fit: contain; background: white; margin-bottom: 16px;">`
        : `<div style="width: 64px; height: 64px; border-radius: 12px; background: var(--surface-container-high); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.5rem; margin-bottom: 16px;">${job.company_name ? job.company_name.substring(0,2).toUpperCase() : 'GF'}</div>`;

    const mobileBackBtn = window.innerWidth <= 1024 
        ? `<button class="btn btn-ghost btn-icon mb-3" onclick="closeMobileDetails()" style="margin-left: -12px;"><span class="material-symbols-outlined">arrow_back</span></button>` 
        : '';

    const isSaved = savedJobIds.includes(job.id);
    const saveIcon = isSaved ? 'bookmark' : 'bookmark_border';

    detailsContainer.innerHTML = `
        ${mobileBackBtn}
        <div class="jd-header">
            ${logoHtml}
            <h2 class="jd-title">${job.title}</h2>
            <div class="jd-meta">
                <span style="display:flex; align-items:center; gap:4px;"><span class="material-symbols-outlined" style="font-size:18px;">business</span> ${job.company_name || 'Anonymous'}</span>
                <span style="display:flex; align-items:center; gap:4px;"><span class="material-symbols-outlined" style="font-size:18px;">public</span> ${job.location || 'Remote'}</span>
                ${job.salary_range ? `<span style="display:flex; align-items:center; gap:4px;"><span class="material-symbols-outlined" style="font-size:18px;">payments</span> ${job.salary_range}</span>` : ''}
            </div>
            
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button onclick="location.href='apply.html?id=${job.id}'" class="btn btn-primary" style="padding: 12px 24px;">
                    Apply Now <span class="material-symbols-outlined" style="font-size:18px; margin-left:8px;">open_in_new</span>
                </button>
                <button class="btn btn-outline btn-icon" onclick="toggleSaveJob('${job.id}')" title="Save Job">
                    <span class="material-symbols-outlined" id="save-icon-${job.id}">${saveIcon}</span>
                </button>
            </div>
        </div>
        
        <div class="jd-body" style="margin-top: 24px; line-height: 1.6;">
            ${job.description}
        </div>
    `;

    detailsContainer.scrollTop = 0;
}

async function toggleSaveJob(jobId) {
    try {
        const res = await API.toggleSaveJob(jobId);
        if (res.saved) {
            savedJobIds.push(jobId);
            showToast('Job saved successfully!', 'success');
        } else {
            savedJobIds = savedJobIds.filter(id => id !== jobId);
            showToast('Job unsaved successfully', 'success');
        }
        renderJobDetails(jobId);
    } catch (e) {
        showToast("Error updating saved status", "error");
    }
}
window.toggleSaveJob = toggleSaveJob;

function setupFilters() {
    const searchInput = document.getElementById('job-search-input');
    const categorySelect = document.getElementById('job-category-select');

    if (!searchInput || !categorySelect) return;

    let debounceTimeout;
    const applyFilters = () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            const query = searchInput.value.trim();
            const category = categorySelect.value;
            const q = category ? (query ? `${query} ${category}` : category) : (query || 'developer');

            const listContainer = document.getElementById('job-list-container');
            if (listContainer) {
                listContainer.innerHTML = `
                    <div style="padding: 32px; text-align: center; color: var(--text-muted);">
                        <span class="material-symbols-outlined spinner" style="font-size: 32px; margin-bottom: 8px;">refresh</span>
                        <p>Searching global jobs...</p>
                    </div>
                `;
            }

            try {
                const res = await API.getJobs({ q: q, location: 'Remote' });
                allJobs = res.jobs || [];
                filteredJobs = [...allJobs];

                if (window.innerWidth > 1024 && filteredJobs.length > 0) {
                    selectedJobId = filteredJobs[0].id;
                } else {
                    selectedJobId = null;
                }

                renderJobList();
                if (selectedJobId) {
                    renderJobDetails(selectedJobId);
                } else if (window.innerWidth > 1024) {
                    showEmptyDetailsPane();
                }
            } catch (err) {
                console.error("Failed to search jobs:", err);
                if (listContainer) {
                    listContainer.innerHTML = `
                        <div style="padding: 32px; text-align: center; color: var(--error);">
                            <span class="material-symbols-outlined" style="font-size: 32px; margin-bottom: 8px;">error</span>
                            <p>Failed to retrieve jobs.</p>
                        </div>
                    `;
                }
            }
        }, 500); // 500ms debounce
    };

    searchInput.addEventListener('input', applyFilters);
    categorySelect.addEventListener('change', applyFilters);
}
