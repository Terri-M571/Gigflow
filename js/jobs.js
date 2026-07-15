/* ==========================================================================
   GIGFLOW - LIVE GLOBAL JOBS BOARD (jobs.js)
   ========================================================================== */

let allJobs = [];
let filteredJobs = [];
let selectedJobId = null;

// Local mock jobs covering all industries
const MOCK_JOBS = [
    {
        id: "101",
        title: "Program Manager (Health & Nutrition)",
        company_name: "Action Against Hunger NGO",
        company_logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/Action_Against_Hunger_logo.svg/1200px-Action_Against_Hunger_logo.svg.png",
        candidate_required_location: "Nairobi, Kenya",
        category: "ngo",
        job_type: "full_time",
        salary: "KES 250,000 - 300,000/mo",
        url: "#apply",
        publication_date: new Date().toISOString(),
        description: "<h3>About the Role</h3><p>We are seeking a highly motivated Program Manager to oversee our Health & Nutrition operations in Kenya. You will be responsible for program design, implementation, and reporting for donor-funded initiatives.</p><h3>Key Responsibilities</h3><ul><li>Manage nutrition and health project cycles.</li><li>Coordinate with local government and health ministries.</li><li>Oversee budget management and reporting.</li></ul><h3>Requirements</h3><ul><li>Master's degree in Public Health or related field.</li><li>5+ years experience in NGO program management.</li></ul>"
    },
    {
        id: "102",
        title: "Senior Frontend Engineer",
        company_name: "Safaricom PLC",
        company_logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Safaricom_logo.svg/1200px-Safaricom_logo.svg.png",
        candidate_required_location: "Nairobi, Kenya / Hybrid",
        category: "tech",
        job_type: "full_time",
        salary: "KES 400,000 - 500,000/mo",
        url: "#apply",
        publication_date: new Date().toISOString(),
        description: "<h3>Role Overview</h3><p>Join Safaricom's digital engineering team. You will lead the development of high-performance web applications handling millions of transactions daily.</p><h3>Skills Needed</h3><ul><li>React, Next.js, TypeScript.</li><li>Micro-frontend architecture experience.</li><li>Agile methodologies.</li></ul>"
    },
    {
        id: "103",
        title: "Communications Officer",
        company_name: "World Wildlife Fund (WWF)",
        company_logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/24/WWF_logo.svg/1200px-WWF_logo.svg.png",
        candidate_required_location: "Remote (Global)",
        category: "ngo",
        job_type: "contract",
        salary: "$4,000 - $5,500/mo",
        url: "#apply",
        publication_date: new Date().toISOString(),
        description: "<h3>Role</h3><p>Lead global communication campaigns focused on conservation. You will manage press releases, social media, and internal communications.</p><h3>Requirements</h3><ul><li>3+ years in PR or Communications.</li><li>Excellent writing skills.</li><li>Passion for wildlife conservation.</li></ul>"
    },
    {
        id: "104",
        title: "Product Designer (UI/UX)",
        company_name: "Cellulant",
        company_logo: "https://ui-avatars.com/api/?name=Cellulant&background=004AC6&color=fff",
        candidate_required_location: "Nairobi, Kenya",
        category: "design",
        job_type: "full_time",
        salary: "KES 200,000/mo",
        url: "#apply",
        publication_date: new Date().toISOString(),
        description: "<h3>About the Role</h3><p>We are looking for a creative Product Designer to design intuitive payment solutions for the African market.</p>"
    },
    {
        id: "105",
        title: "Clinical Officer",
        company_name: "Aga Khan University Hospital",
        company_logo: "https://ui-avatars.com/api/?name=Aga+Khan&background=C97A2B&color=fff",
        candidate_required_location: "Mombasa, Kenya",
        category: "healthcare",
        job_type: "full_time",
        salary: "KES 150,000/mo",
        url: "#apply",
        publication_date: new Date().toISOString(),
        description: "<h3>Role Overview</h3><p>Provide primary clinical care in our outreach clinics.</p>"
    },
    {
        id: "106",
        title: "Financial Analyst",
        company_name: "Equity Bank",
        company_logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Equity_Bank_Kenya_Logo.svg/1200px-Equity_Bank_Kenya_Logo.svg.png",
        candidate_required_location: "Nairobi, Kenya",
        category: "finance",
        job_type: "full_time",
        salary: "KES 280,000/mo",
        url: "#apply",
        publication_date: new Date().toISOString(),
        description: "<h3>Role Overview</h3><p>Analyze market trends, forecast revenue, and assist in strategic corporate planning.</p>"
    },
    {
        id: "107",
        title: "Monitoring & Evaluation (M&E) Specialist",
        company_name: "UNICEF Kenya",
        company_logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/UNICEF_Logo.svg/1200px-UNICEF_Logo.svg.png",
        candidate_required_location: "Nairobi, Kenya",
        category: "ngo",
        job_type: "contract",
        salary: "$5,000/mo",
        url: "#apply",
        publication_date: new Date().toISOString(),
        description: "<h3>Role Overview</h3><p>Lead the M&E framework for our child protection programs across East Africa.</p>"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    loadMockJobs();
    setupFilters();
});

function loadMockJobs() {
    allJobs = MOCK_JOBS;
    filteredJobs = [...allJobs];
    
    if (window.innerWidth > 1024 && filteredJobs.length > 0) {
        selectedJobId = filteredJobs[0].id;
    }
    
    renderJobList();
    if (selectedJobId) {
        renderJobDetails(selectedJobId);
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
        // Safe check for missing logos
        const logoHtml = job.company_logo 
            ? `<img src="${job.company_logo}" alt="${job.company_name}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: contain; background: white;">`
            : `<div style="width: 40px; height: 40px; border-radius: 8px; background: var(--surface-container-high); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800;">${job.company_name.substring(0,2).toUpperCase()}</div>`;

        // Format publication date
        const pubDate = new Date(job.publication_date).toLocaleDateString();

        const isSelected = job.id === selectedJobId ? 'selected' : '';

        const card = document.createElement('div');
        card.className = `job-card-compact ${isSelected}`;
        card.onclick = () => selectJob(job.id);
        
        card.innerHTML = `
            <div style="display: flex; gap: 16px;">
                ${logoHtml}
                <div style="flex: 1;">
                    <h4 style="font-size: 1rem; margin-bottom: 4px; line-height: 1.3;">${job.title}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">${job.company_name} &bull; ${job.candidate_required_location}</p>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <span class="badge" style="background: var(--surface-low);">${job.category}</span>
                        ${job.job_type ? `<span class="badge" style="background: var(--surface-low);">${job.job_type.replace('_', ' ')}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        listContainer.appendChild(card);
    });
}

function selectJob(id) {
    selectedJobId = id;
    
    // Update visual selection
    document.querySelectorAll('.job-card-compact').forEach(card => card.classList.remove('selected'));
    
    // Need to re-render list minimally, or just rely on event target. 
    // For simplicity, re-rendering the list state is fast enough for <50 items.
    renderJobList();
    
    // Render details
    renderJobDetails(id);

    // On mobile, show the details pane overlay
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
        : `<div style="width: 64px; height: 64px; border-radius: 12px; background: var(--surface-container-high); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.5rem; margin-bottom: 16px;">${job.company_name.substring(0,2).toUpperCase()}</div>`;

    // Add back button for mobile
    const mobileBackBtn = window.innerWidth <= 1024 
        ? `<button class="btn btn-ghost btn-icon mb-3" onclick="closeMobileDetails()" style="margin-left: -12px;"><span class="material-symbols-outlined">arrow_back</span></button>` 
        : '';

    detailsContainer.innerHTML = `
        ${mobileBackBtn}
        <div class="jd-header">
            ${logoHtml}
            <h2 class="jd-title">${job.title}</h2>
            <div class="jd-meta">
                <span style="display:flex; align-items:center; gap:4px;"><span class="material-symbols-outlined" style="font-size:18px;">business</span> ${job.company_name}</span>
                <span style="display:flex; align-items:center; gap:4px;"><span class="material-symbols-outlined" style="font-size:18px;">public</span> ${job.candidate_required_location}</span>
                ${job.salary ? `<span style="display:flex; align-items:center; gap:4px;"><span class="material-symbols-outlined" style="font-size:18px;">payments</span> ${job.salary}</span>` : ''}
            </div>
            
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <a href="${job.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 12px 24px;">
                    Apply Now <span class="material-symbols-outlined" style="font-size:18px; margin-left:8px;">open_in_new</span>
                </a>
                <button class="btn btn-outline btn-icon" onclick="saveJobLocally('${job.id}')" title="Save Job">
                    <span class="material-symbols-outlined">bookmark_border</span>
                </button>
            </div>
        </div>
        
        <div class="jd-body">
            ${job.description}
        </div>
    `;

    // Ensure the container is scrolled to top when a new job is selected
    detailsContainer.scrollTop = 0;
}

function setupFilters() {
    const searchInput = document.getElementById('job-search-input');
    const categorySelect = document.getElementById('job-category-select');

    if (!searchInput || !categorySelect) return;

    const applyFilters = () => {
        const query = searchInput.value.toLowerCase();
        const category = categorySelect.value.toLowerCase();

        filteredJobs = allJobs.filter(job => {
            const matchesQuery = job.title.toLowerCase().includes(query) || 
                                 job.company_name.toLowerCase().includes(query);
            
            const matchesCategory = category === '' || job.category.toLowerCase().replace(' ', '-').includes(category);

            return matchesQuery && matchesCategory;
        });

        // Auto-select first result if desktop
        if (window.innerWidth > 1024 && filteredJobs.length > 0) {
            selectedJobId = filteredJobs[0].id;
        } else {
            selectedJobId = null;
        }

        renderJobList();
        if (selectedJobId) {
            renderJobDetails(selectedJobId);
        } else if (window.innerWidth > 1024) {
            document.getElementById('job-details-container').innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); opacity: 0.6;">
                    <span class="material-symbols-outlined" style="font-size: 64px; margin-bottom: 16px;">work</span>
                    <h3 style="font-size: 1.2rem;">Select a job to view details</h3>
                </div>
            `;
        }
    };

    searchInput.addEventListener('input', applyFilters);
    categorySelect.addEventListener('change', applyFilters);
}

// Mock save job functionality bridging back to existing app logic
function saveJobLocally(jobId) {
    const job = allJobs.find(j => j.id === jobId);
    if (!job) return;

    let savedJobs = StorageManager.get(STORAGE_KEYS.SAVED_JOBS) || [];
    
    // Check if already saved
    if (savedJobs.some(j => j.id === jobId)) {
        showToast('Job is already saved!', 'info');
        return;
    }

    // Convert Remotive format to GigFlow internal format
    const gigflowJob = {
        id: job.id.toString(),
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location,
        salary: job.salary || 'Competitive',
        type: job.job_type,
        logo: job.company_logo || '',
        url: job.url,
        savedAt: new Date().toISOString()
    };

    savedJobs.push(gigflowJob);
    StorageManager.set(STORAGE_KEYS.SAVED_JOBS, savedJobs);
    
    showToast('Job saved successfully!', 'success');
}
