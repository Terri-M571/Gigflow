const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../config/db');

// Helper function to query Gemini API if GEMINI_API_KEY is available
async function callGemini(prompt, systemInstruction = '') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        // Fallback simulated intelligent response
        return `[Simulated AI Response - Configure GEMINI_API_KEY in .env for live AI]\n\nBased on your prompt: "${prompt.slice(0, 100)}...", here is a career analysis:\n\n1. Focus on core technical skills.\n2. Align your resume with specific industry metrics.\n3. Practice explaining architectural decisions in interviews.`;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${systemInstruction}\n\nUser Input: ${prompt}` }]
                }]
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }
        throw new Error('Invalid response structure from Gemini API');
    } catch (e) {
        console.error('Gemini call failed:', e.message);
        return `Error generating AI response. Please try again later.`;
    }
}

// ==========================================
// PROFILE MANAGEMENT
// ==========================================
router.get('/profile', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, u.email, u.is_verified, u.auth_provider 
             FROM profiles p 
             JOIN users u ON p.user_id = u.id 
             WHERE u.id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        res.json({ success: true, profile: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/profile', auth, async (req, res) => {
    const { full_name, industry, skills, experience_level, country, city, portfolio_url, linkedin_url, career_interests } = req.body;

    try {
        const result = await pool.query(
            `UPDATE profiles 
             SET full_name = COALESCE($1, full_name), 
                 industry = COALESCE($2, industry), 
                 skills = COALESCE($3, skills), 
                 experience_level = COALESCE($4, experience_level), 
                 country = COALESCE($5, country), 
                 city = COALESCE($6, city), 
                 portfolio_url = COALESCE($7, portfolio_url), 
                 linkedin_url = COALESCE($8, linkedin_url),
                 career_interests = COALESCE($9, career_interests)
             WHERE user_id = $10 
             RETURNING *`,
            [full_name, industry, skills, experience_level, country, city, portfolio_url, linkedin_url, career_interests, req.user.id]
        );

        res.json({ success: true, profile: result.rows[0], message: 'Profile updated successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// JOBS MODULE
// ==========================================
router.get('/jobs', auth, async (req, res) => {
    const { q, type, remote, industry } = req.query;
    try {
        let query = `
            SELECT j.*, c.name as company_name, c.logo_url as company_logo 
            FROM jobs j 
            LEFT JOIN companies c ON j.company_id = c.id 
            WHERE j.status = 'open'
        `;
        const params = [];
        let paramIdx = 1;

        if (q) {
            query += ` AND (j.title ILIKE $${paramIdx} OR j.description ILIKE $${paramIdx})`;
            params.push(`%${q}%`);
            paramIdx++;
        }

        if (type) {
            query += ` AND j.type = $${paramIdx}`;
            params.push(type);
            paramIdx++;
        }

        if (remote) {
            query += ` AND j.is_remote = $${paramIdx}`;
            params.push(remote === 'true');
            paramIdx++;
        }

        if (industry) {
            query += ` AND c.industry = $${paramIdx}`;
            params.push(industry);
            paramIdx++;
        }

        query += ` ORDER BY j.created_at DESC`;

        const result = await pool.query(query, params);
        res.json({ success: true, jobs: result.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.get('/jobs/recommended', auth, async (req, res) => {
    try {
        // Fetch user industry
        const userProfile = await pool.query('SELECT industry FROM profiles WHERE user_id = $1', [req.user.id]);
        const userIndustry = userProfile.rows[0]?.industry || 'Software Development';

        const result = await pool.query(
            `SELECT j.*, c.name as company_name, c.logo_url as company_logo 
             FROM jobs j 
             LEFT JOIN companies c ON j.company_id = c.id 
             WHERE j.status = 'open' AND c.industry = $1
             LIMIT 10`,
            [userIndustry]
        );

        res.json({ success: true, jobs: result.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// SAVED JOBS
// ==========================================
router.get('/jobs/saved', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT j.*, c.name as company_name, c.logo_url as company_logo 
             FROM saved_jobs sj
             JOIN jobs j ON sj.job_id = j.id
             LEFT JOIN companies c ON j.company_id = c.id
             WHERE sj.user_id = $1`,
            [req.user.id]
        );
        res.json({ success: true, jobs: result.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/jobs/:id/save', auth, async (req, res) => {
    const jobId = req.params.id;
    try {
        // Check if already saved
        const check = await pool.query('SELECT * FROM saved_jobs WHERE user_id = $1 AND job_id = $2', [req.user.id, jobId]);
        if (check.rows.length > 0) {
            // Remove
            await pool.query('DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2', [req.user.id, jobId]);
            return res.json({ success: true, saved: false, message: 'Job unsaved successfully' });
        } else {
            // Add
            await pool.query('INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2)', [req.user.id, jobId]);
            return res.json({ success: true, saved: true, message: 'Job saved successfully!' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// APPLICATIONS
// ==========================================
router.get('/applications', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.id, a.job_id, a.user_id, a.cover_letter, a.status, a.ai_match_score, a.created_at,
                    COALESCE(j.title, a.custom_job_title) as job_title,
                    COALESCE(j.type, 'Full-Time') as job_type,
                    COALESCE(c.name, a.custom_company_name) as company_name,
                    COALESCE(j.location, 'Remote') as location
             FROM applications a
             LEFT JOIN jobs j ON a.job_id = j.id
             LEFT JOIN companies c ON j.company_id = c.id
             WHERE a.user_id = $1
             ORDER BY a.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, applications: result.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update Application Status (for Kanban Board drag & drop)
router.put('/applications/:id/status', auth, async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query(
            `UPDATE applications SET status = $1 WHERE id = $2 AND user_id = $3`,
            [status, req.params.id, req.user.id]
        );
        res.json({ success: true, message: 'Application status updated!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add Manual Tracker Application
router.post('/applications/manual', auth, async (req, res) => {
    const { title, company, location, status } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO applications (user_id, custom_job_title, custom_company_name, status, ai_match_score)
             VALUES ($1, $2, $3, $4, 70) RETURNING *`,
            [req.user.id, title, company, status]
        );
        res.status(201).json({ success: true, application: result.rows[0], message: 'Manual application added!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete Application
router.delete('/applications/:id', auth, async (req, res) => {
    try {
        await pool.query(
            `DELETE FROM applications WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.id]
        );
        res.json({ success: true, message: 'Application removed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/jobs/:id/apply', auth, async (req, res) => {
    const jobId = req.params.id;
    const { cover_letter } = req.body;

    try {
        // Calculate standard or AI match score
        const profileResult = await pool.query('SELECT skills FROM profiles WHERE user_id = $1', [req.user.id]);
        const userSkills = profileResult.rows[0]?.skills || [];

        const jobResult = await pool.query('SELECT description FROM jobs WHERE id = $1', [jobId]);
        const jobDesc = jobResult.rows[0]?.description || '';

        // Simple match calculation
        let matches = 0;
        userSkills.forEach(s => {
            if (jobDesc.toLowerCase().includes(s.toLowerCase())) {
                matches++;
            }
        });
        const matchScore = userSkills.length > 0 ? Math.round((matches / userSkills.length) * 100) : 50;

        await pool.query(
            `INSERT INTO applications (job_id, user_id, cover_letter, ai_match_score) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (job_id, user_id) DO UPDATE 
             SET cover_letter = EXCLUDED.cover_letter`,
            [jobId, req.user.id, cover_letter, matchScore]
        );

        // Update Career Analytics application count
        await pool.query(
            `UPDATE career_analytics 
             SET applications_count = applications_count + 1 
             WHERE user_id = $1`,
            [req.user.id]
        );

        res.json({ success: true, message: 'Application securely submitted!', matchScore });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// LEARNING ROADMAP
// ==========================================
router.get('/learning', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM learning_progress WHERE user_id = $1', [req.user.id]);
        
        // Seed default roadmap if empty
        if (result.rows.length === 0) {
            const defaultCourses = [
                'Advanced Data Structures & Algorithms',
                'Design Patterns & Cloud System Architecture',
                'Advanced Full-Stack Engineering Principles',
                'Enterprise Scale Databases and Caching Strategy'
            ];
            for (const course of defaultCourses) {
                await pool.query(
                    'INSERT INTO learning_progress (user_id, course_title, progress_percent) VALUES ($1, $2, 0)',
                    [req.user.id, course]
                );
            }
            const seeded = await pool.query('SELECT * FROM learning_progress WHERE user_id = $1', [req.user.id]);
            return res.json({ success: true, courses: seeded.rows });
        }

        res.json({ success: true, courses: result.rows });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// CAREER ANALYTICS
// ==========================================
router.get('/analytics', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM career_analytics WHERE user_id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            const initial = await pool.query(
                `INSERT INTO career_analytics (user_id, profile_views, applications_count, skills_match_ratio)
                 VALUES ($1, 14, 0, 85.00) RETURNING *`,
                [req.user.id]
            );
            return res.json({ success: true, analytics: initial.rows[0] });
        }
        res.json({ success: true, analytics: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// AI FEATURES (Gemini powered)
// ==========================================

// AI Resume Builder Suggestions
router.post('/ai/resume', auth, async (req, res) => {
    const { skills, bio } = req.body;
    const prompt = `Review my technical profile. 
    Bio: ${bio || 'Not provided'}
    Skills: ${skills ? skills.join(', ') : 'Not provided'}
    Provide structured optimizations for my CV profile, formatting improvements, and suggest 3 high-impact keywords to add.`;
    
    const suggestion = await callGemini(prompt, 'You are an elite executive resume consultant. Provide extremely professional, actionable bullet points.');
    res.json({ success: true, suggestion });
});

// ATS checker
router.post('/ai/ats-check', auth, async (req, res) => {
    const { resumeText, jobDescription } = req.body;
    const prompt = `Resume Content:\n${resumeText}\n\nTarget Job Description:\n${jobDescription}`;
    const sysInstruction = `You are a parsing engine. Match the resume text against the job description. Output a score (e.g. "ATS Match Score: 78%") and list missing vital keywords in bullet points.`;
    
    const analysis = await callGemini(prompt, sysInstruction);
    res.json({ success: true, analysis });
});

// AI Cover Letter Generator
router.post('/ai/cover-letter', auth, async (req, res) => {
    const { jobTitle, companyName, profileSummary } = req.body;
    const prompt = `Write a professional cover letter.
    Target Job: ${jobTitle}
    Target Company: ${companyName}
    My Profile Background: ${profileSummary}`;
    
    const letter = await callGemini(prompt, 'You are a career strategist. Draft a highly compelling, personalized cover letter that highlights standard engineering/design values.');
    res.json({ success: true, letter });
});

// AI Career Coach
router.post('/ai/coach', auth, async (req, res) => {
    const { message, chatHistory } = req.body;
    
    // Fetch profile for context customization
    const profile = await pool.query('SELECT industry, skills FROM profiles WHERE user_id = $1', [req.user.id]);
    const industry = profile.rows[0]?.industry || 'Software Development';
    
    const prompt = `My Selected Industry: ${industry}. Context history: ${JSON.stringify(chatHistory || [])}. Message: ${message}`;
    const sysInstruction = `You are the GigFlow AI Career Coach. Help users build roadmaps, choose languages, pivot careers, and prep for challenges in their field. Answer in concise, structured, professional paragraphs.`;
    
    const reply = await callGemini(prompt, sysInstruction);
    
    // Log AI interaction history
    await pool.query(
        'INSERT INTO ai_history (user_id, type, input, output) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'coach', message, reply]
    );

    res.json({ success: true, reply });
});

// AI Interview Mock Engine
router.post('/ai/interview', auth, async (req, res) => {
    const { question, answer } = req.body;
    const prompt = `Question: ${question}\nUser Answer: ${answer}`;
    const sysInstruction = `Analyze the answer to this technical interview question. Give constructive feedback, tell them what they did well, what details they missed, and provide a rating out of 10.`;
    
    const evaluation = await callGemini(prompt, sysInstruction);
    res.json({ success: true, evaluation });
});

module.exports = router;
