/* ==========================================================================
   GIGFLOW - KANBAN APPLICATION TRACKER (tracker.js)
   ========================================================================= */

document.addEventListener('DOMContentLoaded', async () => {
    // Session check safeguard
    if (!window.currentUser && typeof checkActiveSession === 'function') {
        await checkActiveSession();
    }

    renderKanbanBoard();
    setupDragAndDrop();
});

async function renderKanbanBoard() {
    let apps = [];
    try {
        const res = await API.getApplications();
        apps = res.applications || [];
    } catch (e) {
        console.error("Failed to load applications for Kanban board", e);
        showToast("Error loading applications list", "error");
    }

    const columns = {
        saved: document.getElementById('col-saved'),
        applied: document.getElementById('col-applied'),
        interview: document.getElementById('col-interview'),
        offer: document.getElementById('col-offer'),
        rejected: document.getElementById('col-rejected')
    };

    // Clear Columns
    Object.keys(columns).forEach(key => {
        if (columns[key]) {
            columns[key].innerHTML = '';
        }
    });

    // Populate Columns
    apps.forEach(app => {
        const col = columns[app.status];
        if (col) {
            col.innerHTML += `
                <div class="kanban-card fade-in" draggable="true" id="${app.id}" ondragstart="handleDragStart(event)">
                    <div class="kanban-card-company">${app.company_name || 'Anonymous'}</div>
                    <h4 class="kanban-card-title">${app.job_title}</h4>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">${app.location}</p>
                    <div class="kanban-card-footer">
                        <span>${new Date(app.created_at).toLocaleDateString()}</span>
                        <span class="material-symbols-outlined" style="font-size: 16px; cursor: pointer; color: var(--error);" onclick="deleteApplication('${app.id}')">delete</span>
                    </div>
                </div>
            `;
        }
    });

    // Update Column Count Badges
    Object.keys(columns).forEach(key => {
        const badge = document.getElementById(`count-${key}`);
        if (badge) {
            const count = apps.filter(a => a.status === key).length;
            badge.textContent = count;
        }
    });
}

function setupDragAndDrop() {
    const columns = document.querySelectorAll('.kanban-column');
    columns.forEach(col => {
        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            col.classList.add('drag-over');
        });

        col.addEventListener('dragleave', () => {
            col.classList.remove('drag-over');
        });

        col.addEventListener('drop', async (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');

            const cardId = e.dataTransfer.getData('text/plain');
            const targetStatus = col.id.replace('col-', '');
            
            await updateApplicationStatus(cardId, targetStatus);
        });
    });
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    e.dataTransfer.effectAllowed = 'move';
}

async function updateApplicationStatus(appId, newStatus) {
    try {
        await API.updateApplicationStatus(appId, newStatus);
        renderKanbanBoard();
        showToast(`Moved to ${newStatus}`, 'success');
    } catch (e) {
        showToast("Failed to update status on server", "error");
    }
}

async function deleteApplication(appId) {
    try {
        await API.deleteApplication(appId);
        renderKanbanBoard();
        showToast('Application deleted', 'info');
    } catch (e) {
        showToast("Failed to delete application", "error");
    }
}

function addNewApplicationPrompt() {
    const modal = document.createElement('div');
    modal.className = 'flex-center';
    modal.style.position = 'fixed';
    modal.style.inset = 0;
    modal.style.background = 'rgba(0, 0, 0, 0.4)';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.zIndex = 1000;

    modal.innerHTML = `
        <div class="card" style="width: 100%; max-width: 500px; padding: 32px; background: var(--surface);">
            <h3 style="margin-bottom: 8px;">Add New Application</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">Track a job application manually on your board.</p>
            
            <div class="form-group">
                <label class="form-label">Role Title</label>
                <input class="form-control" type="text" id="new-app-title" placeholder="e.g. Senior Frontend Engineer">
            </div>
            <div class="form-group">
                <label class="form-label">Company Name</label>
                <input class="form-control" type="text" id="new-app-company" placeholder="e.g. Airbnb">
            </div>
            <div class="form-group">
                <label class="form-label">Location</label>
                <input class="form-control" type="text" id="new-app-location" placeholder="e.g. San Francisco or Remote">
            </div>
            <div class="form-group">
                <label class="form-label">Status Column</label>
                <select class="form-control" id="new-app-status">
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
            
            <div class="flex-between" style="margin-top: 24px;">
                <button class="btn btn-outline" onclick="this.closest('.flex-center').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="saveNewApplication(this)">Save Track</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

async function saveNewApplication(btn) {
    const title = document.getElementById('new-app-title').value.trim();
    const company = document.getElementById('new-app-company').value.trim();
    const location = document.getElementById('new-app-location').value.trim();
    const status = document.getElementById('new-app-status').value;

    if (!title || !company) {
        showToast('Please specify job title and company name', 'error');
        return;
    }

    try {
        await API.addManualApplication({
            title,
            company,
            location: location || 'Remote',
            status
        });
        renderKanbanBoard();
        showToast(`Added ${title} application!`, 'success');
        btn.closest('.flex-center').remove();
    } catch (e) {
        showToast("Failed to add application to database", "error");
    }
}

window.handleDragStart = handleDragStart;
window.deleteApplication = deleteApplication;
window.addNewApplicationPrompt = addNewApplicationPrompt;
window.saveNewApplication = saveNewApplication;
