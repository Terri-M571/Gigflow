/* ==========================================================================
   GIGFLOW - ATS RESUME CHECKER CONTROLLER (ats-checker.js)
   ========================================================================= */

let activeResumeText = '';
let activeResumeFilename = '';

document.addEventListener('DOMContentLoaded', async () => {
    // Session bootstrapper
    if (!window.currentUser && typeof checkActiveSession === 'function') {
        await checkActiveSession();
    }

    await checkExistingProfileResume();
    setupDragAndDrop();
});

async function checkExistingProfileResume() {
    try {
        const response = await API.getProfile();
        if (response.success && response.profile && response.profile.resume_url) {
            activeResumeText = response.profile.resume_text || '';
            activeResumeFilename = response.profile.resume_filename || 'Uploaded Resume';
            
            updateUploadZoneUI(activeResumeFilename, true);
        }
    } catch (e) {
        console.warn("Failed to retrieve profile resume:", e);
    }
}

function updateUploadZoneUI(filename, isProfileResume) {
    const zone = document.getElementById('ats-upload-zone');
    if (!zone) return;

    const titleEl = zone.querySelector('h4');
    const infoEl = zone.querySelector('p');
    const iconEl = zone.querySelector('.upload-icon');
    const browseBtn = zone.querySelector('.btn-outline');

    if (filename) {
        titleEl.textContent = `Resume: ${filename}`;
        infoEl.textContent = isProfileResume ? 'Using resume from your profile.' : 'New resume file loaded.';
        if (iconEl) {
            iconEl.textContent = 'check_circle';
            iconEl.style.color = 'var(--success)';
        }
        if (browseBtn) {
            browseBtn.textContent = 'Change File';
        }
    } else {
        titleEl.textContent = 'Drag & Drop your resume PDF here';
        infoEl.textContent = 'Supports PDF, DOCX files up to 5MB.';
        if (iconEl) {
            iconEl.textContent = 'cloud_upload';
            iconEl.style.color = 'var(--primary)';
        }
        if (browseBtn) {
            browseBtn.textContent = 'Browse File';
        }
    }
}

function setupDragAndDrop() {
    const zone = document.getElementById('ats-upload-zone');
    if (!zone) return;

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', async (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            await handleFileSelected(e.dataTransfer.files[0]);
        }
    });
}

async function handleATSResumeSelected(input) {
    if (input.files.length > 0) {
        await handleFileSelected(input.files[0]);
    }
}

async function handleFileSelected(file) {
    if (!file) return;

    // Validate type
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const allowed = ['.pdf', '.docx'];
    if (!allowed.includes(ext)) {
        showToast('❌ Unsupported file type. Only PDF and DOCX are allowed.', 'error');
        return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('❌ File too large. Max size is 5MB.', 'error');
        return;
    }

    showToast('✔ Uploading and parsing resume...', 'info');
    
    // We upload it to the profile route so it extracts the text and associates it
    const formData = new FormData();
    formData.append('resume', file);

    try {
        const response = await API.uploadResume(formData);
        if (response.success) {
            activeResumeFilename = response.resumeFilename;
            // Fetch updated profile to retrieve parsed text
            const profileResponse = await API.getProfile();
            if (profileResponse.success) {
                activeResumeText = profileResponse.profile.resume_text || '';
            }
            updateUploadZoneUI(activeResumeFilename, false);
            showToast('✔ Resume uploaded and loaded!', 'success');
        } else {
            showToast(response.message || '❌ Upload failed', 'error');
        }
    } catch (err) {
        showToast('❌ Error parsing resume file', 'error');
    }
}

async function analyzeResumeATS() {
    const jd = document.getElementById('ats-job-desc').value.trim();
    if (!jd) {
        showToast('❌ Please paste a target Job Description first', 'error');
        return;
    }
    if (!activeResumeText) {
        showToast('❌ Please upload a resume or verify one is attached to your profile', 'error');
        return;
    }

    // Show Shimmer Loader
    const results = document.getElementById('ats-results-panel');
    const loader = document.getElementById('ats-shimmer-loader');
    
    if (results) results.style.display = 'none';
    if (loader) loader.style.display = 'block';

    showToast('✔ Analyzing resume against job description...', 'info');

    try {
        const response = await API.atsCheck(activeResumeText, jd);
        
        if (loader) loader.style.display = 'none';
        if (results) results.style.display = 'block';

        if (response.success && response.analysis) {
            renderATSResults(response.analysis);
            showToast('✔ ATS Scorecard analysis complete!', 'success');
        } else {
            showToast('❌ Failed to run ATS analysis', 'error');
        }
    } catch (e) {
        if (loader) loader.style.display = 'none';
        showToast('❌ Error calling Gemini ATS engine', 'error');
    }
}

function renderATSResults(rawAnalysisText) {
    const scoreCircle = document.getElementById('ats-score-circle');
    const keywordsList = document.getElementById('ats-missing-keywords');

    // Simple parsing logic of Gemini response
    // Match score (e.g. ATS Match Score: 78%)
    const scoreMatch = rawAnalysisText.match(/ATS Match Score:\s*(\d+)%/i) || rawAnalysisText.match(/(\d+)%/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 75; // fallback default

    if (scoreCircle) {
        scoreCircle.textContent = `${score}%`;
        // Color transition based on score
        if (score >= 80) {
            scoreCircle.style.borderColor = 'var(--success)';
            scoreCircle.style.color = 'var(--success)';
        } else if (score >= 60) {
            scoreCircle.style.borderColor = 'var(--warning)';
            scoreCircle.style.color = 'var(--warning)';
        } else {
            scoreCircle.style.borderColor = 'var(--error)';
            scoreCircle.style.color = 'var(--error)';
        }
    }

    if (keywordsList) {
        keywordsList.innerHTML = '';
        
        // Render rich analysis content formatted nicely
        const cleanContent = document.createElement('div');
        cleanContent.className = 'ats-raw-results';
        cleanContent.style.whiteSpace = 'pre-line';
        cleanContent.style.fontSize = '0.9rem';
        cleanContent.style.lineHeight = '1.6';
        cleanContent.style.color = 'var(--text-color)';
        cleanContent.textContent = rawAnalysisText;

        keywordsList.appendChild(cleanContent);
    }
}

// Expose globally
window.handleATSResumeSelected = handleATSResumeSelected;
window.analyzeResumeATS = analyzeResumeATS;
