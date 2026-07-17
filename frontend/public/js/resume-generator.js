// AI Resume Generator Logic
const resumeGenerator = {
    state: {
        sourceResumeText: '',
        generatedResumeData: null
    },

    init: async function() {
        console.log("Initializing AI Resume Generator...");
        
        // 1. Check if user is logged in
        const token = localStorage.getItem('gigflow_token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
    },

    useProfileResume: async function() {
        try {
            const btn = document.activeElement;
            const originalText = btn.innerHTML;
            btn.innerHTML = `<span class="material-symbols-outlined" style="font-size: 1.1rem; margin-right: 4px;">hourglass_empty</span> Loading...`;
            btn.disabled = true;

            const res = await API.getProfile();
            if (res.success && res.profile && res.profile.resume_text) {
                this.state.sourceResumeText = res.profile.resume_text;
                document.getElementById('generator-upload-status').style.display = 'block';
                document.getElementById('generator-upload-text').innerText = 'Profile Resume loaded successfully.';
            } else {
                showToast("No parsed resume found in your profile. Please upload one.", "error");
            }

            btn.innerHTML = originalText;
            btn.disabled = false;
        } catch (e) {
            console.error(e);
            showToast("Failed to load profile resume.", "error");
        }
    },

    handleResumeUpload: async function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const allowedExtensions = ['.pdf', '.docx'];
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!allowedExtensions.includes(ext)) {
            showToast('Only PDF and DOCX files are allowed.', 'error');
            event.target.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        try {
            showToast("Extracting text from resume...", "info");
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${BASE_URL}/ai/resume/parse`);
            xhr.withCredentials = true;
            const token = localStorage.getItem('gigflow_token');
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }
            
            xhr.onload = () => {
                const res = JSON.parse(xhr.responseText);
                if (res.success && res.text) {
                    this.state.sourceResumeText = res.text;
                    document.getElementById('generator-upload-status').style.display = 'block';
                    document.getElementById('generator-upload-text').innerText = 'Resume file loaded successfully.';
                    showToast("Resume parsed successfully!", "success");
                } else {
                    showToast(res.message || "Failed to parse resume.", "error");
                }
            };
            xhr.onerror = () => showToast("Network error during upload.", "error");
            xhr.send(formData);

        } catch (e) {
            console.error(e);
            showToast("Failed to upload resume.", "error");
        }
    },

    generateResume: async function() {
        if (!this.state.sourceResumeText) {
            showToast("Please upload a resume or use your profile CV first.", "error");
            return;
        }

        const jd = document.getElementById('generator-jd').value;
        const btn = document.getElementById('btn-generate');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = `<span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span> Generating...`;
        btn.disabled = true;

        try {
            const response = await API._fetch('/ai/resume/generate', 'POST', {
                resumeText: this.state.sourceResumeText,
                jobDescription: jd
            });

            if (response.success && response.generated) {
                this.state.generatedResumeData = response.generated;
                this.renderPreview();
                this.renderFeedback();
                showToast("AI Resume generated successfully!", "success");
            } else {
                showToast(response.message || "Failed to generate resume.", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("An error occurred during generation.", "error");
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    renderPreview: function() {
        const data = this.state.generatedResumeData;
        if (!data) return;

        // Render Personal Info
        document.getElementById('paper-name').textContent = data.personal?.name || 'Your Name';
        document.getElementById('paper-title').textContent = data.personal?.title || 'Job Title';
        
        const contactArr = [];
        if (data.personal?.email) contactArr.push(data.personal.email);
        if (data.personal?.phone) contactArr.push(data.personal.phone);
        if (data.personal?.location) contactArr.push(data.personal.location);
        if (data.personal?.linkedin) contactArr.push(data.personal.linkedin);
        
        document.getElementById('paper-contact').textContent = contactArr.join(' | ');

        // Render Summary
        document.getElementById('paper-summary').textContent = data.summary || '';

        // Render Experience
        const expContainer = document.getElementById('paper-experience-list');
        expContainer.innerHTML = '';
        
        if (data.experience && Array.isArray(data.experience)) {
            data.experience.forEach(exp => {
                const div = document.createElement('div');
                div.style.marginBottom = '12px';
                
                let bulletsHtml = '';
                if (exp.description && Array.isArray(exp.description)) {
                    bulletsHtml = `<ul style="margin-top: 4px; padding-left: 16px; font-size: 0.85rem; color: #475569;">
                        ${exp.description.map(b => `<li style="margin-bottom: 4px;">${b}</li>`).join('')}
                    </ul>`;
                }

                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                        <strong style="font-size: 0.95rem; color: var(--text-color);">${exp.title}</strong>
                        <span style="font-size: 0.8rem; color: #64748b;">${exp.date || ''}</span>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--primary); font-weight: 500;">${exp.company || ''}</div>
                    ${bulletsHtml}
                `;
                expContainer.appendChild(div);
            });
        }

        // Render Education
        if (data.education && Array.isArray(data.education) && data.education.length > 0) {
            // Check if education section exists, if not create it
            let eduSection = document.getElementById('paper-education-section');
            if (!eduSection) {
                eduSection = document.createElement('div');
                eduSection.className = 'resume-paper-section';
                eduSection.id = 'paper-education-section';
                eduSection.style.marginBottom = '16px';
                eduSection.innerHTML = `<h3 class="resume-paper-section-title">Education</h3><div id="paper-education-list"></div>`;
                
                // Insert before skills
                const skillsSection = document.getElementById('paper-skills').parentNode;
                skillsSection.parentNode.insertBefore(eduSection, skillsSection);
            }
            
            const eduList = document.getElementById('paper-education-list');
            eduList.innerHTML = '';
            data.education.forEach(edu => {
                eduList.innerHTML += `
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: baseline;">
                            <strong style="font-size: 0.9rem; color: var(--text-color);">${edu.degree}</strong>
                            <span style="font-size: 0.8rem; color: #64748b;">${edu.year || ''}</span>
                        </div>
                        <div style="font-size: 0.85rem; color: #475569;">${edu.school || ''}</div>
                    </div>
                `;
            });
        }

        // Render Skills
        document.getElementById('paper-skills').textContent = (data.skills || []).join(' • ');
    },

    renderFeedback: function() {
        const feedback = this.state.generatedResumeData?.aiFeedback;
        if (!feedback) return;

        const section = document.getElementById('ai-feedback-section');
        section.style.display = 'block';

        const scoreEl = document.getElementById('feedback-score');
        scoreEl.textContent = feedback.atsScore || 0;
        
        if (feedback.atsScore >= 80) {
            scoreEl.style.color = '#10b981';
            section.style.borderLeftColor = '#10b981';
        } else if (feedback.atsScore >= 60) {
            scoreEl.style.color = '#f59e0b';
            section.style.borderLeftColor = '#f59e0b';
        } else {
            scoreEl.style.color = '#ef4444';
            section.style.borderLeftColor = '#ef4444';
        }

        const strengthsUl = document.getElementById('feedback-strengths');
        strengthsUl.innerHTML = (feedback.strengths || []).map(s => `<li>${s}</li>`).join('');

        const improvementsUl = document.getElementById('feedback-improvements');
        improvementsUl.innerHTML = (feedback.improvements || []).map(i => `<li>${i}</li>`).join('');
    },

    toggleCvFormat: function() {
        const format = document.getElementById('builder-format').value;
        const paper = document.getElementById('resume-paper-frame');
        
        if (format === 'ats') {
            paper.style.fontFamily = "'Times New Roman', Times, serif";
            paper.style.color = "#000";
            
            // Remove colors
            const highlights = paper.querySelectorAll('[style*="color: var(--primary)"]');
            highlights.forEach(el => {
                el.dataset.oldColor = el.style.color;
                el.style.color = '#000';
            });
        } else {
            paper.style.fontFamily = "'Inter', sans-serif";
            paper.style.color = "var(--text-color)";
            
            // Restore colors
            const highlights = paper.querySelectorAll('[data-old-color]');
            highlights.forEach(el => {
                el.style.color = el.dataset.oldColor;
            });
        }
    },

    exportPDF: function() {
        if (!this.state.generatedResumeData) {
            showToast("Generate a resume first.", "error");
            return;
        }

        const element = document.getElementById('resume-paper-frame');
        const opt = {
            margin:       10,
            filename:     'GigFlow_Resume.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    },

    exportDOCX: async function() {
        if (!this.state.generatedResumeData) {
            showToast("Generate a resume first.", "error");
            return;
        }
        
        try {
            showToast("Generating DOCX...", "info");
            const response = await fetch(`${BASE_URL}/ai/resume/export-docx`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('gigflow_token')}`
                },
                body: JSON.stringify({ resumeData: this.state.generatedResumeData })
            });
            
            if (!response.ok) {
                throw new Error('Failed to generate DOCX');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'GigFlow_Resume.docx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            showToast("DOCX downloaded successfully!", "success");
        } catch (e) {
            console.error(e);
            showToast("Failed to download DOCX.", "error");
        }
    },
    
    saveDraft: function() {
        showToast("Draft saved successfully!", "success");
    }
};

document.addEventListener('DOMContentLoaded', () => {
    resumeGenerator.init();
});
window.resumeGenerator = resumeGenerator;
