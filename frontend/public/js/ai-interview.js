let selectedAvatarType = 'female';

function selectAvatar(element, type) {
    document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
    selectedAvatarType = type;
}

function startInterview() {
    document.getElementById('interview-setup').style.display = 'none';
    document.getElementById('interview-active').style.display = 'flex';
    
    const videoStream = document.getElementById('ai-video-stream');
    const label = document.getElementById('ai-interviewer-label');
    const subtitles = document.getElementById('ai-subtitles');
    
    if (selectedAvatarType === 'female') {
        videoStream.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800';
        label.textContent = 'Sarah (HR Manager)';
    } else if (selectedAvatarType === 'male') {
        videoStream.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800';
        label.textContent = 'David (Technical Lead)';
    } else {
        videoStream.src = 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800';
        label.textContent = 'Engineering Panel';
    }

    // Simulate AI greeting after a short delay
    setTimeout(() => {
        subtitles.style.display = 'block';
        const user = JSON.parse(localStorage.getItem('gigflow_session'));
        const name = user ? user.name : 'there';
        subtitles.innerHTML = `<span>Hello ${name}! Thank you for joining us today. Let's start by discussing your background.</span>`;
        
        setTimeout(() => {
            subtitles.style.display = 'none';
        }, 5000);
    }, 2000);
}

function toggleMic(btn) {
    btn.classList.toggle('muted');
    const icon = btn.querySelector('span');
    icon.textContent = btn.classList.contains('muted') ? 'mic_off' : 'mic';
}

function toggleCam(btn) {
    btn.classList.toggle('off');
    const icon = btn.querySelector('span');
    icon.textContent = btn.classList.contains('off') ? 'videocam_off' : 'videocam';
}

function endInterview() {
    if(confirm('Are you sure you want to end the interview?')) {
        document.getElementById('interview-active').style.display = 'none';
        document.getElementById('interview-setup').style.display = 'flex';
        showToast('Interview session ended', 'info');
    }
}
