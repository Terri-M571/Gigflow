const fs = require('fs');
const path = require('path');

async function runTests() {
    console.log('🏁 Starting GigFlow E2E API Integration Tests...');
    const email = `test_qa_${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    const fullName = 'QA Integration Tester';
    const industry = 'Software Development';

    let cookie = '';

    // 1. REGISTER
    console.log('\nStep 1: Registering new user...');
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, industry })
    });
    const regData = await regRes.json();
    if (!regRes.ok) {
        throw new Error(`Registration failed: ${regData.message}`);
    }
    console.log('✅ User registered successfully!', regData.user.id);

    // 2. LOGIN
    console.log('\nStep 2: Logging in...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
        throw new Error(`Login failed: ${loginData.message}`);
    }
    
    // Extract sb_access_token cookie
    const setCookieHeader = loginRes.headers.get('set-cookie');
    if (setCookieHeader) {
        cookie = setCookieHeader.split(';')[0];
    }
    console.log('✅ Logged in successfully! Session token retrieved.');

    // 3. UPLOAD RESUME
    console.log('\nStep 3: Uploading resume file...');
    const resumePath = path.join(__dirname, '../frontend/public/test_resume.pdf');
    const fileBuffer = fs.readFileSync(resumePath);
    const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });
    
    const formData = new FormData();
    formData.append('resume', fileBlob, 'test_resume.pdf');

    const uploadRes = await fetch('http://localhost:5000/api/profile/resume', {
        method: 'POST',
        headers: {
            'Cookie': cookie
        },
        body: formData
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
        throw new Error(`Resume upload failed: ${uploadData.message}`);
    }
    console.log('✅ Resume uploaded successfully!', uploadData.resumeFilename);

    // 4. VERIFY PROFILE METADATA & PARSED TEXT
    console.log('\nStep 4: Verifying profile parsing...');
    const profileRes = await fetch('http://localhost:5000/api/profile', {
        method: 'GET',
        headers: { 'Cookie': cookie }
    });
    const profileData = await profileRes.json();
    if (!profileRes.ok) {
        throw new Error(`Profile fetch failed: ${profileData.message}`);
    }
    console.log('✅ Profile resume text extracted length:', profileData.profile.resume_text ? profileData.profile.resume_text.length : 0);
    console.log('✅ Profile resume URL path:', profileData.profile.resume_url);

    // 5. GENERATE AI COVER LETTER
    console.log('\nStep 5: Compiling AI Cover Letter...');
    const clRes = await fetch('http://localhost:5000/api/ai/cover-letter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        },
        body: JSON.stringify({
            jobTitle: 'Senior React Developer',
            companyName: 'OpenAI',
            profileSummary: 'Experienced full stack engineer.'
        })
    });
    const clData = await clRes.json();
    if (!clRes.ok) {
        throw new Error(`AI Cover Letter failed: ${clData.message}`);
    }
    console.log('✅ Cover letter compiled successfully! Length:', clData.letter ? clData.letter.length : 0);

    // 6. CHECK COVER LETTER HISTORY
    console.log('\nStep 6: Listing Cover Letter History...');
    const histRes = await fetch('http://localhost:5000/api/cover-letters', {
        method: 'GET',
        headers: { 'Cookie': cookie }
    });
    const histData = await histRes.json();
    if (!histRes.ok) {
        throw new Error(`History fetch failed: ${histData.message}`);
    }
    console.log('✅ Saved cover letters count in database:', histData.coverLetters ? histData.coverLetters.length : 0);

    // 7. ATS CHECK
    console.log('\nStep 7: Optimizing Resume with ATS Checker...');
    const atsRes = await fetch('http://localhost:5000/api/ai/ats-check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        },
        body: JSON.stringify({
            resumeText: profileData.profile.resume_text || 'React developer',
            jobDescription: 'Looking for a React developer with Node.js and SQL skills.'
        })
    });
    const atsData = await atsRes.json();
    if (!atsRes.ok) {
        throw new Error(`ATS Check failed: ${atsData.message}`);
    }
    console.log('✅ ATS Scorecard analysis complete!');
    console.log('📊 Result snippet:', atsData.analysis ? atsData.analysis.substring(0, 150) + '...' : 'None');

    console.log('\n🎉 ALL E2E API INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
    console.error('\n❌ TEST RUN FAILED:', err.message);
    process.exit(1);
});
