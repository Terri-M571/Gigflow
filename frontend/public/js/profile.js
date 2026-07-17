/* ==========================================================================
   GIGFLOW - PROFILE CONTROLLER (profile.js)
   ========================================================================= */

document.addEventListener('DOMContentLoaded', async () => {
    // Ensure session is bootstrapped
    if (!window.currentUser && typeof checkActiveSession === 'function') {
        await checkActiveSession();
    }
    
    // Initialize custom typeahead selectors
    initSearchableDropdown('profile-role-container', 'profile-role', OCCUPATIONS, {
        groupByCategory: true,
        hiddenInputId: 'profile-role-value'
    });
    initSearchableDropdown('profile-industry-container', 'profile-industry', INDUSTRIES, {
        hiddenInputId: 'profile-industry-value'
    });

    await loadProfileData();

    const profileForm = document.getElementById('profile-edit-form');
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfileData);
    }

    const avatarInput = document.getElementById('profile-avatar-input');
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarUpload);
    }

    // Set up resume file input change listener
    const resumeInput = document.getElementById('profile-resume-input');
    if (resumeInput) {
        resumeInput.addEventListener('change', handleResumeUpload);
    }
});

async function loadProfileData() {
    try {
        const response = await API.getProfile();
        if (!response.success || !response.profile) return;
        const profile = response.profile;
        
        setValue('profile-name', profile.full_name);
        setValue('profile-bio', profile.experience_level || ''); // Summary/bio
        setValue('profile-experience', profile.experience_level || '');
        setValue('profile-skills', profile.skills ? profile.skills.join(', ') : '');
        setValue('profile-links', profile.linkedin_url || profile.portfolio_url || '');
        setValue('profile-education', profile.highest_education || '');
        setValue('profile-languages', profile.languages || '');
        setValue('profile-availability', profile.availability_status || 'Available');
        
        // Populating typeahead search inputs
        setValue('profile-role', profile.role || '');
        setValue('profile-role-value', profile.role || '');
        setValue('profile-industry', profile.industry || '');
        setValue('profile-industry-value', profile.industry || '');
        
        // Render Avatar
        if (profile.profile_picture) {
            const previewImg = document.getElementById('profile-avatar-preview');
            if (previewImg) previewImg.src = profile.profile_picture;
        }

        // Render Resume Metadata
        renderResumeUI(profile.resume_filename, profile.resume_url);

    } catch (e) {
        console.error("Error loading profile configuration:", e);
        showToast("Failed to load profile details", "error");
    }
}

function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
}

async function saveProfileData(e) {
    e.preventDefault();

    const name = document.getElementById('profile-name').value.trim();
    const skillsText = document.getElementById('profile-skills').value.trim();
    const experience = document.getElementById('profile-experience').value.trim();
    const links = document.getElementById('profile-links').value.trim();
    const education = document.getElementById('profile-education').value.trim();
    const languages = document.getElementById('profile-languages').value.trim();
    const availability = document.getElementById('profile-availability').value;
    const bio = document.getElementById('profile-bio').value.trim();
    const role = document.getElementById('profile-role-value')?.value || document.getElementById('profile-role').value;
    const industry = document.getElementById('profile-industry-value')?.value || document.getElementById('profile-industry').value;

    const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);

    try {
        await API.updateProfile({
            full_name: name,
            skills,
            experience_level: experience,
            portfolio_url: links,
            highest_education: education,
            languages: languages,
            availability_status: availability,
            career_interests: skills,
            role: role || '',
            industry: industry || ''
        });
        
        showToast('Profile updated successfully!', 'success');
        
        // Refresh session context in UI
        if (window.checkActiveSession) {
            await window.checkActiveSession();
            if (window.injectLayouts) window.injectLayouts();
        }
    } catch (err) {
        showToast(err.message || 'Error updating profile', 'error');
    }
}

async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Profile picture must be under 5MB', 'error');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file (JPG, PNG, WEBP)', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const base64Avatar = event.target.result;
        
        try {
            await API.updateProfile({
                profile_picture: base64Avatar
            });
            
            const previewImg = document.getElementById('profile-avatar-preview');
            if (previewImg) previewImg.src = base64Avatar;

            const navAvatars = document.querySelectorAll('.user-avatar');
            navAvatars.forEach(av => {
                av.src = base64Avatar;
            });
            showToast('Avatar updated successfully!', 'success');
        } catch (err) {
            showToast('Failed to save avatar image', 'error');
        }
    };
    reader.readAsDataURL(file);
}

async function removeAvatar() {
    try {
        await API.updateProfile({
            profile_picture: null
        });
        
        const previewImg = document.getElementById('profile-avatar-preview');
        const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuD-McpRx1yuPgxpS_tSkdJjKZMG-X5msmkvOtILPl13aDd2lNepRmLbNOobLhbi1AYCMWbc57IhcEmukqKRgiM8ijGIOGmkiLAsJv0oYKPWGC-gDfxLPOPVgnUAWhhsfVkCiKDWoGJ92c2CGgCq1ETxr0aF7nMWCt3ANb_Qzo_H7CXJ28MYKnYxNK3k4GiKCTraUl-nVfEde7XG8S7zlVay7NoOK0-UE-ztcWex86oqL4PWJs6POxKp";
        if (previewImg) previewImg.src = defaultAvatar;

        const navAvatars = document.querySelectorAll('.user-avatar');
        navAvatars.forEach(av => {
            av.src = defaultAvatar;
        });
        showToast('Profile picture removed', 'info');
    } catch (e) {
        showToast('Failed to remove profile picture', 'error');
    }
}

// ==========================================
// RESUME UPLOAD LOGIC
// ==========================================
async function handleResumeUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validation checks
    const allowedExtensions = ['.pdf', '.docx'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
        showToast('Unsupported file type. Only PDF and DOCX files are allowed.', 'error');
        e.target.value = '';
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        showToast('File is too large. Max size is 5MB.', 'error');
        e.target.value = '';
        return;
    }

    // Prepare upload
    const formData = new FormData();
    formData.append('resume', file);

    const progressContainer = document.getElementById('resume-progress-container');
    const progressBar = document.getElementById('resume-progress-bar');
    
    if (progressContainer && progressBar) {
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
    }

    try {
        const response = await API.uploadResume(formData, (percent) => {
            if (progressBar) progressBar.style.width = `${percent}%`;
        });

        if (response.success) {
            showToast('Resume uploaded and parsed successfully!', 'success');
            renderResumeUI(response.resumeFilename, response.resumeUrl);
        } else {
            showToast(response.message || 'Upload failed', 'error');
        }
    } catch (err) {
        showToast(err.message || 'Error uploading file', 'error');
    } finally {
        setTimeout(() => {
            if (progressContainer) progressContainer.style.display = 'none';
        }, 1000);
        e.target.value = '';
    }
}

async function deleteResume() {
    if (!confirm('Are you sure you want to remove your resume?')) return;
    try {
        const response = await API.deleteResume();
        if (response.success) {
            showToast('Resume removed successfully', 'info');
            renderResumeUI(null, null);
        } else {
            showToast(response.message || 'Delete failed', 'error');
        }
    } catch (err) {
        showToast('Error removing resume file', 'error');
    }
}

function renderResumeUI(filename, url) {
    const filenameEl = document.getElementById('resume-filename');
    const deleteBtn = document.getElementById('delete-resume-btn');
    
    if (!filenameEl) return;

    if (filename && url) {
        filenameEl.innerHTML = `<a href="${url}" target="_blank" style="color: var(--primary); font-weight: 600; text-decoration: underline;">${filename}</a>`;
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
    } else {
        filenameEl.textContent = 'No resume attached yet';
        if (deleteBtn) deleteBtn.style.display = 'none';
    }
}

window.removeAvatar = removeAvatar;
window.deleteResume = deleteResume;
