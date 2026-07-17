// Resume Generator State Management & UI Logic
const resumeBuilder = {
    state: {
        name: '',
        title: '',
        email: '',
        location: '',
        summary: '',
        experience: [
            { id: 1, title: 'Senior Engineer', company: 'Tech Corp', responsibilities: 'Led a team of 5 developers to build scalable APIs.' }
        ],
        skills: ''
    },

    init: async function() {
        console.log("Initializing Resume Generator...");
        
        // 1. Check if user is logged in
        const token = localStorage.getItem('gigflow_token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        // 2. Try to load saved draft
        try {
            const res = await API._fetch('/profile/resume-builder', 'GET');
            if (res.success && res.data) {
                const savedState = JSON.parse(res.data);
                this.state = { ...this.state, ...savedState };
                showToast('Loaded saved resume draft.', 'success');
            } else {
                // If no draft, auto-fill basic info from current session
                const userSession = JSON.parse(localStorage.getItem('gigflow_session'));
                if (userSession) {
                    this.state.name = userSession.name || '';
                    this.state.email = userSession.email || '';
                }
            }
        } catch (e) {
            console.error("Error loading resume draft:", e);
        }

        this.renderInputs();
        this.updatePreview();
    },

    renderInputs: function() {
        document.getElementById('builder-name').value = this.state.name;
        document.getElementById('builder-title').value = this.state.title;
        document.getElementById('builder-email').value = this.state.email;
        document.getElementById('builder-location').value = this.state.location;
        document.getElementById('builder-summary').value = this.state.summary;
        document.getElementById('builder-skills').value = this.state.skills;

        this.renderExperienceInputs();
    },

    renderExperienceInputs: function() {
        const container = document.getElementById('experience-list');
        container.innerHTML = '';
        
        this.state.experience.forEach((exp, index) => {
            const expDiv = document.createElement('div');
            expDiv.className = 'experience-item';
            expDiv.style.border = '1px solid var(--border-color)';
            expDiv.style.padding = '16px';
            expDiv.style.borderRadius = '8px';
            expDiv.style.position = 'relative';

            expDiv.innerHTML = `
                <button class="btn btn-icon" style="position: absolute; top: 8px; right: 8px; color: var(--danger);" onclick="resumeBuilder.removeExperience(${exp.id})">
                    <span class="material-symbols-outlined" style="font-size: 1.2rem;">delete</span>
                </button>
                <div class="form-group">
                    <label class="form-label">Job Title</label>
                    <input class="form-control" type="text" value="${exp.title}" oninput="resumeBuilder.updateExpField(${exp.id}, 'title', this.value)">
                </div>
                <div class="form-group">
                    <label class="form-label">Company</label>
                    <input class="form-control" type="text" value="${exp.company}" oninput="resumeBuilder.updateExpField(${exp.id}, 'company', this.value)">
                </div>
                <div class="form-group">
                    <label class="form-label">Responsibilities / Achievements</label>
                    <div style="position: relative;">
                        <textarea class="form-control" rows="3" oninput="resumeBuilder.updateExpField(${exp.id}, 'responsibilities', this.value)">${exp.responsibilities}</textarea>
                        <button class="btn btn-icon" style="position: absolute; bottom: 8px; right: 8px; background: var(--bg-color); border: 1px solid var(--border-color); color: var(--primary); padding: 4px; border-radius: 4px;" onclick="resumeBuilder.improveExpText(${exp.id})" title="Improve with AI">
                            <span class="material-symbols-outlined" style="font-size: 1.1rem;">auto_awesome</span>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(expDiv);
        });
    },

    updateExpField: function(id, field, value) {
        const exp = this.state.experience.find(e => e.id === id);
        if (exp) {
            exp[field] = value;
            this.updatePreview();
        }
    },

    addExperience: function() {
        const newId = this.state.experience.length > 0 ? Math.max(...this.state.experience.map(e => e.id)) + 1 : 1;
        this.state.experience.push({ id: newId, title: '', company: '', responsibilities: '' });
        this.renderExperienceInputs();
        this.updatePreview();
    },

    removeExperience: function(id) {
        this.state.experience = this.state.experience.filter(e => e.id !== id);
        this.renderExperienceInputs();
        this.updatePreview();
    },

    updateStateFromDOM: function() {
        this.state.name = document.getElementById('builder-name').value;
        this.state.title = document.getElementById('builder-title').value;
        this.state.email = document.getElementById('builder-email').value;
        this.state.location = document.getElementById('builder-location').value;
        this.state.summary = document.getElementById('builder-summary').value;
        this.state.skills = document.getElementById('builder-skills').value;
    },

    updatePreview: function() {
        this.updateStateFromDOM();

        document.getElementById('paper-name').textContent = this.state.name || 'Your Name';
        document.getElementById('paper-title').textContent = this.state.title || 'Job Title';
        
        const contactStr = [this.state.email, this.state.location].filter(Boolean).join(' | ');
        document.getElementById('paper-contact').textContent = contactStr || 'you@example.com | Location';
        
        document.getElementById('paper-summary').textContent = this.state.summary || '';
        document.getElementById('paper-skills').textContent = this.state.skills || '';

        const expContainer = document.getElementById('paper-experience-list');
        expContainer.innerHTML = '';
        this.state.experience.forEach(exp => {
            const expDiv = document.createElement('div');
            expDiv.className = 'resume-paper-item';
            expDiv.innerHTML = `
                <div class="resume-paper-item-header" style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 4px;">
                    <span>${exp.title || 'Job Title'}</span>
                    <span>${exp.company || 'Company'}</span>
                </div>
                <p style="margin-top: 4px; font-size: 0.85rem; color: #475569; white-space: pre-wrap; line-height: 1.5;">${exp.responsibilities || ''}</p>
            `;
            expContainer.appendChild(expDiv);
        });
    },

    toggleCvFormat: function() {
        const format = document.getElementById('builder-format').value;
        const paper = document.getElementById('resume-paper-frame');
        
        if (format === 'ats') {
            paper.style.fontFamily = 'Arial, Helvetica, sans-serif';
            paper.style.color = '#000000';
            paper.style.boxShadow = 'none';
            paper.style.border = '1px solid #ccc';
            document.getElementById('paper-name').style.color = '#000';
            document.getElementById('paper-title').style.color = '#000';
            
            // ATS removes fancy colors from section titles
            document.querySelectorAll('.resume-paper-section-title').forEach(el => {
                el.style.color = '#000';
                el.style.borderBottom = '2px solid #000';
            });
            document.querySelectorAll('.resume-paper-item-header').forEach(el => {
                el.style.color = '#000';
            });
            document.querySelectorAll('p').forEach(el => el.style.color = '#000');
            
        } else {
            // Modern Format
            paper.style.fontFamily = 'var(--font-heading)';
            paper.style.color = 'var(--text-color)';
            paper.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
            paper.style.border = '1px solid var(--border-color)';
            document.getElementById('paper-name').style.color = 'var(--text-color)';
            document.getElementById('paper-title').style.color = 'var(--primary)';
            
            // Restore colors
            document.querySelectorAll('.resume-paper-section-title').forEach(el => {
                el.style.color = 'var(--primary)';
                el.style.borderBottom = '2px solid var(--primary-light)';
            });
            document.querySelectorAll('.resume-paper-item-header').forEach(el => {
                el.style.color = 'var(--text-color)';
            });
            document.querySelectorAll('p').forEach(el => el.style.color = '#475569');
            document.getElementById('paper-contact').style.color = '#64748b';
        }
        
        showToast(`Switched to ${format.toUpperCase()} format`, 'info');
    },

    saveDraft: async function() {
        this.updateStateFromDOM();
        const btn = document.getElementById('btn-save');
        btn.innerHTML = '<span class="loader"></span> Saving...';
        btn.disabled = true;

        try {
            await API._fetch('/profile/resume-builder', 'PUT', { data: this.state });
            showToast('Draft Saved!', 'success');
        } catch(e) {
            showToast('Failed to save draft', 'error');
        } finally {
            btn.innerHTML = 'Save Draft';
            btn.disabled = false;
        }
    },

    autoFillFromProfile: async function() {
        showToast('Fetching profile data...', 'info');
        try {
            const res = await API._fetch('/profile', 'GET');
            if(res.success && res.profile) {
                const p = res.profile;
                this.state.name = p.full_name || this.state.name;
                this.state.title = p.role || this.state.title;
                this.state.email = p.email || this.state.email;
                this.state.location = [p.city, p.country].filter(Boolean).join(', ') || this.state.location;
                if(p.skills) {
                    this.state.skills = Array.isArray(p.skills) ? p.skills.join(', ') : p.skills;
                }
                
                // If they have extracted text from a resume, try to dump it in summary for now
                if(p.resume_text && !this.state.summary) {
                    this.state.summary = p.resume_text.substring(0, 300) + '...';
                }

                this.renderInputs();
                this.updatePreview();
                showToast('Profile data loaded', 'success');
            }
        } catch(e) {
            showToast('Error loading profile', 'error');
        }
    },

    exportPDF: function() {
        const element = document.getElementById('resume-paper-frame');
        showToast('Generating high-quality PDF...', 'info');
        
        const opt = {
            margin:       10,
            filename:     `${this.state.name.replace(/\s+/g, '_')}_Resume.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            showToast('PDF Exported Successfully!', 'success');
        }).catch(err => {
            console.error('PDF Export Error:', err);
            showToast('Error exporting PDF', 'error');
        });
    },

    exportDOCX: async function() {
        this.updateStateFromDOM();
        showToast('Generating DOCX...', 'info');
        try {
            const token = localStorage.getItem('gigflow_token');
            const res = await fetch(`${BASE_URL}/resume/export-docx`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(this.state)
            });
            if (!res.ok) throw new Error('Failed to generate DOCX');
            
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.state.name ? this.state.name.replace(/\s+/g, '_') : 'Resume'}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            
            showToast('DOCX Exported Successfully!', 'success');
        } catch (e) {
            console.error(e);
            showToast('Error exporting DOCX', 'error');
        }
    },

    // ==========================================
    // AI INTEGRATION
    // ==========================================
    
    generateAIResume: async function() {
        this.updateStateFromDOM();
        if(!this.state.title) {
            showToast('Please enter a Target Job Title first', 'error');
            return;
        }

        const btn = document.getElementById('btn-ai-generate');
        const jd = document.getElementById('builder-jd') ? document.getElementById('builder-jd').value : '';
        btn.innerHTML = '<span class="loader"></span> Generating...';
        btn.disabled = true;

        try {
            const payload = {
                title: this.state.title,
                bio: this.state.summary,
                skills: this.state.skills.split(',').map(s=>s.trim()).filter(Boolean)
            };
            if (jd) payload.jobDescription = jd;

            const res = await API._fetch('/ai/resume/generate', 'POST', payload);
            
            if(res.success && res.generated) {
                const gen = res.generated;
                this.state.summary = gen.summary || this.state.summary;
                
                // Map generated bullets to the first experience item, or create one
                if(gen.experienceBullets && gen.experienceBullets.length > 0) {
                    if(this.state.experience.length === 0) {
                        this.state.experience.push({ id: 1, title: this.state.title, company: 'Example Corp', responsibilities: ''});
                    }
                    this.state.experience[0].responsibilities = gen.experienceBullets.map(b => '• ' + b).join('\n');
                }

                this.renderInputs();
                this.updatePreview();
                showToast('Resume generated successfully!', 'success');
            }
        } catch(e) {
            showToast('AI Generation failed', 'error');
        } finally {
            btn.innerHTML = 'Generate Resume';
            btn.disabled = false;
        }
    },

    improveText: async function(type) {
        let textToImprove = '';
        let textAreaId = '';
        if(type === 'summary') {
            textToImprove = this.state.summary;
            textAreaId = 'builder-summary';
        }
        
        if(!textToImprove) {
            showToast('Please enter some text to improve first', 'info');
            return;
        }

        showToast('AI is optimizing text...', 'info');
        try {
            const res = await API._fetch('/ai/resume/improve', 'POST', { text: textToImprove, type: type });
            if(res.success && res.improvement) {
                document.getElementById(textAreaId).value = res.improvement;
                this.updatePreview();
                showToast('Text optimized!', 'success');
            }
        } catch(e) {
            showToast('AI optimization failed', 'error');
        }
    },

    improveExpText: async function(id) {
        const exp = this.state.experience.find(e => e.id === id);
        if(!exp || !exp.responsibilities) {
            showToast('Enter some responsibilities to improve', 'info');
            return;
        }
        
        showToast('AI is optimizing experience...', 'info');
        try {
            const res = await API._fetch('/ai/resume/improve', 'POST', { text: exp.responsibilities, type: 'work experience bullets' });
            if(res.success && res.improvement) {
                exp.responsibilities = res.improvement;
                this.renderInputs();
                this.updatePreview();
                showToast('Experience optimized!', 'success');
            }
        } catch(e) {
            showToast('AI optimization failed', 'error');
        }
    },

    suggestSkills: async function() {
        this.updateStateFromDOM();
        if(!this.state.title) {
            showToast('Please enter a Target Job Title first', 'error');
            return;
        }

        showToast('AI is suggesting skills...', 'info');
        try {
            const res = await API._fetch('/ai/resume/skills', 'POST', { title: this.state.title });
            if(res.success && res.skills) {
                const currentSkills = this.state.skills ? this.state.skills.split(',').map(s=>s.trim()).filter(Boolean) : [];
                // Merge without duplicates
                const newSkills = [...new Set([...currentSkills, ...res.skills])];
                
                this.state.skills = newSkills.join(', ');
                this.renderInputs();
                this.updatePreview();
                showToast('Skills added!', 'success');
            }
        } catch(e) {
            showToast('AI suggestions failed', 'error');
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    resumeBuilder.init();
});
