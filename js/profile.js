/* ==========================================================================
   GIGFLOW - PROFILE CONTROLLER (profile.js)
   ========================================================================== */

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

function loadProfileData() {
    const savedProfile = localStorage.getItem('gigflow_profile');
    if (!savedProfile) return;

    try {
        const profile = JSON.parse(savedProfile);
        
        // Populate inputs if they exist
        setValue('profile-name', profile.name);
        setValue('profile-bio', profile.bio);
        setValue('profile-experience', profile.experience);
        setValue('profile-education', profile.education);
        setValue('profile-languages', profile.languages);
        setValue('profile-links', profile.links);
        setValue('profile-availability', profile.availability);

        if (profile.skills) {
            setValue('profile-skills', profile.skills.join(', '));
        }

        // Set images
        if (profile.avatar) {
            const previewImg = document.getElementById('profile-avatar-preview');
            if (previewImg) previewImg.src = profile.avatar;
        }
    } catch (e) {
        console.error("Error loading profile configuration:", e);
    }
}

function setValue(id, val) {
    const el = document.getElementById(id);
    if (el && val) el.value = val;
}

function saveProfileData(e) {
    e.preventDefault();

    const name = document.getElementById('profile-name').value.trim();
    const bio = document.getElementById('profile-bio').value.trim();
    const skillsText = document.getElementById('profile-skills').value.trim();
    const experience = document.getElementById('profile-experience').value.trim();
    const education = document.getElementById('profile-education').value.trim();
    const languages = document.getElementById('profile-languages').value.trim();
    const links = document.getElementById('profile-links').value.trim();
    const availability = document.getElementById('profile-availability').value;

    const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);

    // Maintain existing avatar unless updated
    let existingAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-McpRx1yuPgxpS_tSkdJjKZMG-X5msmkvOtILPl13aDd2lNepRmLbNOobLhbi1AYCMWbc57IhcEmukqKRgiM8ijGIOGmkiLAsJv0oYKPWGC-gDfxLPOPVgnUAWhhsfVkCiKDWoGJ92c2CGgCq1ETxr0aF7nMWCt3ANb_Qzo_H7CXJ28MYKnYxNK3k4GiKCTraUl-nVfEde7XG8S7zlVay7NoOK0-UE-ztcWex86oqL4PWJs6POxKp';
    const savedProfile = localStorage.getItem('gigflow_profile');
    if (savedProfile) {
        const profileObj = JSON.parse(savedProfile);
        if (profileObj.avatar) existingAvatar = profileObj.avatar;
    }

    const updatedProfile = {
        name,
        bio,
        skills,
        experience,
        education,
        languages,
        links,
        availability,
        avatar: existingAvatar
    };

    localStorage.setItem('gigflow_profile', JSON.stringify(updatedProfile));
    
    // If name changed, update the user session too
    const userSession = StorageManager.get(STORAGE_KEYS.USER_SESSION);
    if (userSession) {
        userSession.name = name;
        StorageManager.set(STORAGE_KEYS.USER_SESSION, userSession);
    }

    // Refresh navbar avatar
    const navAvatars = document.querySelectorAll('.user-avatar');
    navAvatars.forEach(av => {
        av.src = existingAvatar;
    });

    showToast('Profile information updated successfully!', 'success');
}

function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Only image files are allowed', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const base64Data = event.target.result;
        
        // Update Preview Image
        const previewImg = document.getElementById('profile-avatar-preview');
        if (previewImg) previewImg.src = base64Data;

        // Save inside LocalStorage
        const savedProfile = localStorage.getItem('gigflow_profile');
        let profile = {};
        if (savedProfile) {
            profile = JSON.parse(savedProfile);
        }
        profile.avatar = base64Data;
        localStorage.setItem('gigflow_profile', JSON.stringify(profile));

        // Update Navbars immediately
        const navAvatars = document.querySelectorAll('.user-avatar');
        navAvatars.forEach(av => {
            av.src = base64Data;
        });

        showToast('Profile photo updated!', 'success');
    };
    reader.readAsDataURL(file);
}
