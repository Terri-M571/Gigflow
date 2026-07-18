/* ==========================================================================
   GIGFLOW - REAL-TIME SECURE APPLICATION LOGIC (apply.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const applyForm = document.getElementById('secure-apply-form');
    const submitBtn = document.getElementById('submit-btn');
    const jobTitleDisplay = document.getElementById('job-title-display');

    if (!applyForm) return;

    // Get Job ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('jobId') || 'job_' + Math.random().toString(36).substr(2, 9);
    
    // Attempt to parse the job title (In a real app, we'd fetch job details from API)
    const storedJobs = JSON.parse(localStorage.getItem('gigflow_jobs')) || [];
    const job = storedJobs.find(j => j.id === jobId);
    if (jobTitleDisplay) {
        jobTitleDisplay.innerHTML = `Applying for: <strong style="color:var(--text-color);">${job ? job.title : 'Selected Position'}</strong>`;
    }

    // Pre-fill user data if logged in
    const currentUser = JSON.parse(localStorage.getItem('gigflow_session'));
    if (currentUser) {
        document.getElementById('apply-fullname').value = currentUser.name || '';
        document.getElementById('apply-email').value = currentUser.email || '';
    }

    applyForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Basic Client-Side Validation
        const fullName = document.getElementById('apply-fullname').value.trim();
        const email = document.getElementById('apply-email').value.trim();
        const phone = document.getElementById('apply-phone').value.trim();
        const linkedin = document.getElementById('apply-linkedin').value.trim();
        const coverLetter = document.getElementById('apply-coverletter').value.trim();

        if (!fullName || !email) {
            showToast('Please fill out all required fields.', 'error');
            return;
        }

        // 2. Disable button to prevent spam (Rate Limiting Simulation)
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="material-symbols-outlined spinner">sync</span> Submitting securely...';

        try {
            // Send Secure API Request to Backend
            const applicationData = {
                fullName,
                email,
                phone,
                linkedin,
                cover_letter: coverLetter
            };

            const response = await API.request(`/jobs/${jobId}/apply`, 'POST', applicationData);

            if (!response.success) {
                throw new Error(response.message || 'API submission failed');
            }

            // Success Flow
            showToast(response.message || 'Application securely submitted!', 'success');
            
            // Redirect back to jobs board after 2 seconds
            setTimeout(() => {
                window.location.href = 'jobs.html';
            }, 2000);

        } catch (error) {
            showToast('An error occurred. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
});
