/* ==========================================================================
   GIGFLOW - FREELANCE MARKETPLACE CONTROLLER (freelance.js)
   ========================================================================== */

let currentProjects = [];
let filteredProjects = [];

document.addEventListener('DOMContentLoaded', () => {
    currentProjects = StorageManager.get(STORAGE_KEYS.PROJECTS) || [];
    filteredProjects = [...currentProjects];

    const params = new URLSearchParams(window.location.search);
    const projId = params.get('id');

    if (projId) {
        loadProjectDetails(projId);
    } else {
        renderProjectList();
        setupFreelanceFilters();
    }
});

function renderProjectList() {
    const container = document.getElementById('freelance-marketplace-list');
    if (!container) return;

    container.innerHTML = '';
    if (filteredProjects.length === 0) {
        container.innerHTML = `
            <div class="text-center p-5" style="grid-column: span 2; color: var(--text-muted);">
                <span class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 12px;">search_off</span>
                <h3>No projects match your search</h3>
                <p>Try resetting filters or changing terms.</p>
            </div>
        `;
        return;
    }

    filteredProjects.forEach(proj => {
        container.innerHTML += `
            <div class="card hover-lift fade-in" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div class="flex-between" style="margin-bottom: 16px;">
                        <div>
                            <span class="badge badge-secondary" style="margin-bottom: 8px;">${proj.category}</span>
                            <h3 style="font-size: 1.15rem; margin-bottom: 2px;">${proj.title}</h3>
                            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0;">Client: ${proj.client} &bull; Rating: &starf; ${proj.rating}</p>
                        </div>
                        <div style="font-weight: 800; font-size: 1.25rem; color: var(--primary);">
                            ${proj.budget}
                        </div>
                    </div>
                    <p style="font-size: 0.9rem; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 16px;">
                        ${proj.description}
                    </p>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                        ${proj.skills.map(s => `<span class="badge badge-primary">${s}</span>`).join('')}
                    </div>
                </div>
                <div class="flex-between" style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: auto;">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Duration: ${proj.duration} &bull; ${proj.proposals} Proposals</span>
                    <div style="display: flex; gap: 8px;">
                        <a href="project-details.html?id=${proj.id}" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;">Details</a>
                        <button class="btn btn-secondary" onclick="openProposalModal('${proj.id}')" style="padding: 6px 12px; font-size: 0.8rem;">Submit Proposal</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function setupFreelanceFilters() {
    const searchInput = document.getElementById('freelance-search');
    const categorySelect = document.getElementById('freelance-category');

    if (!searchInput) return;

    const filterAction = () => {
        const query = searchInput.value.toLowerCase();
        const cat = categorySelect ? categorySelect.value.toLowerCase() : '';

        filteredProjects = currentProjects.filter(p => {
            const matchesQuery = p.title.toLowerCase().includes(query) || 
                                 p.description.toLowerCase().includes(query) || 
                                 p.skills.some(s => s.toLowerCase().includes(query));
            const matchesCat = !cat || p.category.toLowerCase() === cat;
            return matchesQuery && matchesCat;
        });

        renderProjectList();
    };

    searchInput.addEventListener('input', filterAction);
    if (categorySelect) categorySelect.addEventListener('change', filterAction);
}

function loadProjectDetails(id) {
    const proj = currentProjects.find(p => p.id === id);
    if (!proj) return;

    document.getElementById('proj-details-title').textContent = proj.title;
    document.getElementById('proj-details-client').textContent = proj.client;
    document.getElementById('proj-details-rating').textContent = `${proj.rating} / 5.0`;
    document.getElementById('proj-details-budget').textContent = proj.budget;
    document.getElementById('proj-details-category').textContent = proj.category;
    document.getElementById('proj-details-duration').textContent = proj.duration;
    document.getElementById('proj-details-proposals').textContent = proj.proposals;
    document.getElementById('proj-details-description').textContent = proj.description;

    const skillsContainer = document.getElementById('proj-details-skills');
    if (skillsContainer) {
        skillsContainer.innerHTML = proj.skills.map(s => `<span class="badge badge-primary">${s}</span>`).join('');
    }

    const submitBtn = document.getElementById('proj-details-submit-btn');
    if (submitBtn) {
        submitBtn.onclick = () => openProposalModal(proj.id);
    }
}

function openProposalModal(projId) {
    const modal = document.createElement('div');
    modal.className = 'flex-center';
    modal.style.position = 'fixed';
    modal.style.inset = 0;
    modal.style.background = 'rgba(0, 0, 0, 0.4)';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.zIndex = 1000;

    modal.innerHTML = `
        <div class="card" style="width: 100%; max-width: 500px; padding: 32px; background: var(--surface);">
            <h3 style="margin-bottom: 8px;">Submit Proposal</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">Pitch your skills to the client for this freelance project.</p>
            
            <div class="form-group">
                <label class="form-label">Your Bid Rate ($)</label>
                <input class="form-control" type="number" id="proposal-rate" placeholder="Enter amount">
            </div>
            <div class="form-group">
                <label class="form-label">Cover Pitch</label>
                <textarea class="form-control" id="proposal-cover" rows="4" placeholder="Explain why you are the best fit for this project..."></textarea>
            </div>
            
            <div class="flex-between" style="margin-top: 24px;">
                <button class="btn btn-outline" onclick="this.closest('.flex-center').remove()">Cancel</button>
                <button class="btn btn-secondary" onclick="submitProposal('${projId}', this)">Submit Proposal</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function submitProposal(projId, btn) {
    const rate = document.getElementById('proposal-rate').value;
    const cover = document.getElementById('proposal-cover').value;

    if (!rate || !cover) {
        showToast('Please specify your rate and write a pitch', 'error');
        return;
    }

    showToast('Proposal submitted successfully!', 'success');
    btn.closest('.flex-center').remove();
}
window.openProposalModal = openProposalModal;
window.submitProposal = submitProposal;
