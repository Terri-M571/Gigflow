/* ==========================================================================
   GIGFLOW - AI COVER LETTER CONTROLLER (cover-letter.js)
   ========================================================================= */

let currentLetterId = null;
let coverLettersHistory = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Session check safeguard
    if (!window.currentUser && typeof checkActiveSession === 'function') {
        await checkActiveSession();
    }

    await loadCoverLettersHistory();
    setupDraftEditBinds();
});

async function loadCoverLettersHistory() {
    const historyContainer = document.getElementById('cl-history-list');
    if (!historyContainer) return;

    historyContainer.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--text-muted);">
            <span class="material-symbols-outlined spinner">refresh</span>
            <p style="font-size: 0.8rem; margin-top: 4px;">Loading letters...</p>
        </div>
    `;

    try {
        const res = await API.getCoverLetters();
        coverLettersHistory = res.coverLetters || [];

        historyContainer.innerHTML = '';
        if (coverLettersHistory.length === 0) {
            historyContainer.innerHTML = `
                <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                    <p>No cover letters saved yet.</p>
                </div>
            `;
            return;
        }

        coverLettersHistory.forEach(cl => {
            const dateStr = new Date(cl.created_at).toLocaleDateString();
            const item = document.createElement('div');
            item.className = 'history-item';
            item.style = `
                padding: 12px; 
                border-bottom: 1px solid var(--border-color); 
                cursor: pointer;
                transition: background 0.2s ease;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            // Hover styling
            item.onmouseover = () => item.style.background = 'var(--surface-low)';
            item.onmouseout = () => item.style.background = 'transparent';

            item.innerHTML = `
                <div style="flex: 1; min-width: 0;" onclick="loadLetter('${cl.id}')">
                    <h5 style="margin: 0; font-size: 0.88rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-color);">${cl.title}</h5>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${dateStr}</span>
                </div>
                <button type="button" class="btn btn-ghost" style="padding: 4px; color: var(--error);" onclick="deleteLetter('${cl.id}')" title="Delete">
                    <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
                </button>
            `;
            historyContainer.appendChild(item);
        });
    } catch (e) {
        console.error("Error loading cover letter history:", e);
        historyContainer.innerHTML = `
            <div style="padding: 16px; text-align: center; color: var(--error); font-size: 0.85rem;">
                <p>Failed to load history.</p>
            </div>
        `;
    }
}

async function generateCoverLetter() {
    const company = document.getElementById('cl-company').value.trim();
    const role = document.getElementById('cl-role').value.trim();
    const jd = document.getElementById('cl-jd').value.trim();
    const tone = document.getElementById('cl-tone').value;

    if (!company || !role) {
        showToast('❌ Please specify Company and Position Title first', 'error');
        return;
    }

    const compileBtn = document.querySelector('button[onclick="generateCoverLetter()"]');
    const originalText = compileBtn.innerHTML;
    
    compileBtn.innerHTML = `<span class="material-symbols-outlined spinner" style="font-size:18px; margin-right:6px;">refresh</span> Compiling...`;
    compileBtn.disabled = true;

    showToast('✔ Request sent to Gemini AI...', 'info');

    try {
        // Collect current profile context if loaded, otherwise empty bio
        const summary = jd ? `Tone: ${tone}. Job Requirements: ${jd}` : `Tone: ${tone}`;
        const response = await API.generateCoverLetter(role, company, summary);

        if (response.success && response.letter) {
            document.getElementById('cl-output-text').value = response.letter;
            currentLetterId = response.id;
            
            showToast('✔ Cover Letter generated and saved to history!', 'success');
            await loadCoverLettersHistory();
        } else {
            showToast('❌ AI letter generation failed', 'error');
        }
    } catch (err) {
        showToast(err.message || '❌ AI letter generation failed', 'error');
    } finally {
        compileBtn.innerHTML = originalText;
        compileBtn.disabled = false;
    }
}

function loadLetter(id) {
    const letter = coverLettersHistory.find(cl => cl.id === id);
    if (!letter) return;

    currentLetterId = letter.id;
    document.getElementById('cl-output-text').value = letter.content;
    
    // Parse title to extract company and role if possible
    const companyInput = document.getElementById('cl-company');
    const roleInput = document.getElementById('cl-role');
    
    // e.g. Cover Letter - Software Engineer (TechFlow)
    const title = letter.title || '';
    if (title.startsWith('Cover Letter - ')) {
        const part = title.replace('Cover Letter - ', '');
        const match = part.match(/(.*)\((.*)\)/);
        if (match && match.length >= 3) {
            if (roleInput) roleInput.value = match[1].trim();
            if (companyInput) companyInput.value = match[2].trim();
        }
    }
    
    showToast('Loaded saved cover letter from history', 'info');
}

async function saveLetterDraft() {
    const content = document.getElementById('cl-output-text').value.trim();
    if (content.includes('Your generated cover letter will render here') || !content) {
        showToast('❌ No letter content to save', 'error');
        return;
    }

    const company = document.getElementById('cl-company').value.trim() || 'General';
    const role = document.getElementById('cl-role').value.trim() || 'Role';
    const title = `Cover Letter - ${role} (${company})`;

    try {
        if (currentLetterId) {
            // Update existing letter draft
            await API.updateCoverLetter(currentLetterId, { title, content });
            showToast('✔ Cover letter draft updated successfully!', 'success');
        } else {
            // Save new letter draft
            const res = await API.saveCoverLetter({ title, content });
            currentLetterId = res.coverLetter.id;
            showToast('✔ New cover letter draft saved successfully!', 'success');
        }
        await loadCoverLettersHistory();
    } catch (err) {
        showToast('❌ Failed to save draft', 'error');
    }
}

async function deleteLetter(id) {
    if (!confirm('Delete this cover letter from your history?')) return;
    try {
        await API.deleteCoverLetter(id);
        if (currentLetterId === id) {
            currentLetterId = null;
            document.getElementById('cl-output-text').value = 'Your generated cover letter will render here. Fill in the parameters and click generate.';
        }
        showToast('Cover letter deleted', 'info');
        await loadCoverLettersHistory();
    } catch (e) {
        showToast('Failed to delete cover letter', 'error');
    }
}

function copyCLText() {
    const txt = document.getElementById('cl-output-text').value;
    if (txt.includes('will render here') || !txt) {
        showToast('❌ Please generate a letter first', 'error');
        return;
    }
    navigator.clipboard.writeText(txt);
    showToast('✔ Cover letter copied to clipboard!', 'success');
}

function downloadCLPDF() {
    const txt = document.getElementById('cl-output-text').value;
    if (txt.includes('will render here') || !txt) {
        showToast('❌ Please generate a letter first', 'error');
        return;
    }

    showToast('✔ Preparing PDF download...', 'success');

    // Create a temporary element styled like a professional document
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.fontFamily = 'serif';
    element.style.lineHeight = '1.6';
    element.style.fontSize = '12pt';
    element.style.color = '#333';
    element.style.whiteSpace = 'pre-line';
    element.textContent = txt;

    // Use html2pdf if available, otherwise fallback to simple print window
    if (typeof html2pdf !== 'undefined') {
        const company = document.getElementById('cl-company').value.trim() || 'Company';
        const role = document.getElementById('cl-role').value.trim() || 'Role';
        const filename = `Cover_Letter_${role.replace(/\s+/g, '_')}_${company.replace(/\s+/g, '_')}.pdf`;
        
        const opt = {
            margin:       1,
            filename:     filename,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    } else {
        // Fallback print approach
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Cover Letter</title></head><body style="padding:40px; font-family:serif; line-height:1.6; white-space:pre-line;">');
        printWindow.document.write(txt);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }
}

async function downloadCLDOCX() {
    const txt = document.getElementById('cl-output-text').value;
    if (txt.includes('will render here') || !txt) {
        showToast('❌ Please generate a letter first', 'error');
        return;
    }

    try {
        showToast('Generating DOCX...', 'info');
        const response = await fetch(`${BASE_URL}/ai/cover-letter/export-docx`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('gigflow_token')}`
            },
            body: JSON.stringify({ content: txt })
        });
        
        if (!response.ok) throw new Error('Failed to generate DOCX');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const company = document.getElementById('cl-company').value.trim() || 'Company';
        const role = document.getElementById('cl-role').value.trim() || 'Role';
        a.download = `Cover_Letter_${role.replace(/\s+/g, '_')}_${company.replace(/\s+/g, '_')}.docx`;
        
        a.href = url;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        showToast('✔ DOCX downloaded successfully!', 'success');
    } catch (e) {
        console.error(e);
        showToast('Failed to download DOCX', 'error');
    }
}

function setupDraftEditBinds() {
    // Add dynamic change listener to textarea to auto-detect edits
    const textarea = document.getElementById('cl-output-text');
    if (!textarea) return;

    textarea.addEventListener('focus', () => {
        if (textarea.value.includes('will render here')) {
            textarea.value = '';
        }
    });

    textarea.addEventListener('blur', () => {
        if (!textarea.value.trim()) {
            textarea.value = 'Your generated cover letter will render here. Fill in the parameters and click generate.';
        }
    });
}

// Expose globally
window.generateCoverLetter = generateCoverLetter;
window.copyCLText = copyCLText;
window.downloadCLPDF = downloadCLPDF;
window.downloadCLDOCX = downloadCLDOCX;
window.loadLetter = loadLetter;
window.deleteLetter = deleteLetter;
window.saveLetterDraft = saveLetterDraft;
