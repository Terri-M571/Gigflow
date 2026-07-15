/* ==========================================================================
   GIGFLOW - PROFILE CONTROLLER (profile.js)
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();

    const profileForm = document.getElementById('profile-edit-form');
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfileData);
    }

    const avatarInput = document.getElementById('profile-avatar-input');
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarUpload);
    }
});

async function loadProfileData() {
    try {
        const response = await API.getProfile();
        const profile = response.profile;
        
        setValue('profile-name', profile.full_name);
        setValue('profile-bio', profile.experience_level || '');
        setValue('profile-experience', profile.experience_level || '');
        setValue('profile-skills', profile.skills ? profile.skills.join(', ') : '');
        setValue('profile-links', profile.linkedin_url || '');
        
        if (profile.profile_picture) {
            const previewImg = document.getElementById('profile-avatar-preview');
            if (previewImg) previewImg.src = profile.profile_picture;
        }
    } catch (e) {
        console.error("Error loading profile configuration:", e);
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

    const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);

    try {
        await API.updateProfile({
            full_name: name,
            skills,
            experience_level: experience,
            linkedin_url: links
        });
        showToast('Profile updated in Supabase successfully!', 'success');
        
        // Refresh session context in UI
        if (window.checkActiveSession) {
            await window.checkActiveSession();
            if (window.injectLayouts) window.injectLayouts();
        }
    } catch (err) {
        showToast(err.message || 'Error updating profile', 'error');
    }
}

function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const base64Avatar = event.target.result;
        
        // Save avatar locally or update profile on backend
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
