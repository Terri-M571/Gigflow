
const db = require('../backend/config/db');

async function testResumeAPI() {
    console.log('Testing Resume Builder API endpoints...');
    
    // Test AI Generate
    try {
        const genRes = await fetch('http://localhost:5000/api/ai/resume/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Software Engineer',
                bio: 'I build stuff',
                skills: ['Node.js', 'React']
            })
        });
        const genData = await genRes.json();
        console.log('Generate Resume:', genData.success ? 'PASS' : 'FAIL', genData);
    } catch(e) {
        console.error('Generate Error:', e.message);
    }

    // Test AI Improve
    try {
        const impRes = await fetch('http://localhost:5000/api/ai/resume/improve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: 'Did some coding and fixed bugs',
                type: 'work experience bullets'
            })
        });
        const impData = await impRes.json();
        console.log('Improve Resume:', impData.success ? 'PASS' : 'FAIL', impData);
    } catch(e) {
        console.error('Improve Error:', e.message);
    }

    // Test AI Skills
    try {
        const skillRes = await fetch('http://localhost:5000/api/ai/resume/skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Product Manager' })
        });
        const skillData = await skillRes.json();
        console.log('Suggest Skills:', skillData.success ? 'PASS' : 'FAIL', skillData);
    } catch(e) {
        console.error('Skills Error:', e.message);
    }

}

testResumeAPI();
