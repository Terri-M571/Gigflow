const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../config/db');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

// Configure upload directories
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const resumesDir = path.join(uploadDir, 'resumes');
if (!fs.existsSync(resumesDir)) {
    fs.mkdirSync(resumesDir, { recursive: true });
}
const portfoliosDir = path.join(uploadDir, 'portfolios');
if (!fs.existsSync(portfoliosDir)) {
    fs.mkdirSync(portfoliosDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'resume') {
            cb(null, resumesDir);
        } else if (file.fieldname === 'portfolio') {
            cb(null, portfoliosDir);
        } else {
            cb(null, uploadDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (file.fieldname === 'resume') {
            const allowed = ['.pdf', '.docx'];
            if (allowed.includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error('Only PDF and DOCX formats are supported for resumes.'));
            }
        } else if (file.fieldname === 'portfolio') {
            const allowed = ['.pdf', '.pptx'];
            if (allowed.includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error('Only PDF and PPTX formats are supported for portfolio decks.'));
            }
        } else {
            cb(null, true);
        }
    }
});

// Helper function to extract text from files
async function extractTextFromFile(filePath, originalName) {
    const ext = path.extname(originalName).toLowerCase();
    if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } else if (ext === '.docx') {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    }
    return '';
}

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
    const { full_name, industry, skills, experience_level, country, city, linkedin_url, career_interests, role, is_complete } = req.body;

    try {
        const result = await pool.query(
            `UPDATE profiles 
             SET full_name = COALESCE($1, full_name), 
                 industry = COALESCE($2, industry), 
                 skills = COALESCE($3, skills), 
                 experience_level = COALESCE($4, experience_level), 
                 country = COALESCE($5, country), 
                 city = COALESCE($6, city), 
                 linkedin_url = COALESCE($7, linkedin_url),
                 career_interests = COALESCE($8, career_interests),
                 role = COALESCE($9, role),
                 is_complete = COALESCE($10, is_complete)
             WHERE user_id = $11 
             RETURNING *`,
            [full_name, industry, skills, experience_level, country, city, linkedin_url, career_interests, role, (is_complete === true ? 1 : (is_complete === false ? 0 : null)), req.user.id]
        );

        res.json({ success: true, profile: result.rows[0], message: 'Profile updated successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================
// RESUME UPLOAD & MANAGEMENT
// ==========================================
router.post('/profile/resume', auth, upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded or file type is unsupported' });
    }

    try {
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const relativeUrl = `/uploads/resumes/${req.file.filename}`;

        // Extract text from the resume
        let extractedText = '';
        try {
            extractedText = await extractTextFromFile(filePath, fileName);
        } catch (parseErr) {
            console.error('Failed to parse resume text:', parseErr.message);
        }

        let parsedData = {};
        if (extractedText) {
            const prompt = `Extract the following details from this resume in strictly valid JSON format:
{
  "skills": ["skill1", "skill2"],
  "experience_level": "one of: '0-2', '3-5', '5-10', '10+' based on years of experience",
  "role": "Current or target job title",
  "industry": "General industry category"
}
Return ONLY JSON without markdown wrapping. 
Resume text: ${extractedText.substring(0, 15000)}`;
            try {
                const aiResponse = await callGemini(prompt, "You are a resume parsing assistant.");
                let cleanResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                parsedData = JSON.parse(cleanResponse);
            } catch (e) {
                console.error("Failed to parse resume via AI", e);
            }
        }

        // Save metadata and file path to profiles table
        await pool.query(
            `UPDATE profiles 
             SET resume_url = $1, 
                 resume_filename = $2, 
                 resume_text = $3
             WHERE user_id = $4`,
            [relativeUrl, fileName, extractedText, req.user.id]
        );

        res.json({
            success: true,
            message: 'Resume uploaded and processed successfully!',
            resumeUrl: relativeUrl,
            resumeFilename: fileName,
            parsedData: parsedData
        });
    } catch (err) {
        console.error('Resume upload error:', err.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

router.delete('/profile/resume', auth, async (req, res) => {
    try {
        // Fetch current resume path
        const profile = await pool.query('SELECT resume_url FROM profiles WHERE user_id = $1', [req.user.id]);
        if (profile.rows.length > 0 && profile.rows[0].resume_url) {
            const relUrl = profile.rows[0].resume_url;
            const absolutePath = path.join(__dirname, '..', relUrl);
            
            // Delete file from disk
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        }

        // Clear resume details in db
        await pool.query(
            `UPDATE profiles 
             SET resume_url = NULL, 
                 resume_filename = NULL, 
                 resume_text = NULL
             WHERE user_id = $1`,
            [req.user.id]
        );

        res.json({ success: true, message: 'Resume deleted successfully!' });
    } catch (err) {
        console.error('Resume delete error:', err.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ==========================================
// RESUME BUILDER STATE MANAGEMENT
// ==========================================
router.get('/profile/resume-builder', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT resume_builder_data FROM profiles WHERE user_id = $1', [req.user.id]);
        res.json({ success: true, data: result.rows[0]?.resume_builder_data });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/profile/resume-builder', auth, async (req, res) => {
    const { data } = req.body;
    try {
        await pool.query(
            'UPDATE profiles SET resume_builder_data = $1 WHERE user_id = $2',
            [data ? JSON.stringify(data) : null, req.user.id]
        );
        res.json({ success: true, message: 'Resume draft saved successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ==========================================


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

// Parse Resume for AI Generator
router.post('/ai/resume/parse', auth, upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    try {
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const extractedText = await extractTextFromFile(filePath, fileName);
        
        // Clean up file after extracting text to save space
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ success: true, text: extractedText });
    } catch (e) {
        console.error('Failed to parse uploaded resume:', e);
        res.status(500).json({ success: false, message: 'Failed to extract text from resume' });
    }
});

router.post('/ai/resume/generate', auth, async (req, res) => {
    const { resumeText, jobDescription } = req.body;
    
    if (!resumeText) {
        return res.status(400).json({ success: false, message: 'Resume text is required' });
    }

    let prompt = `Here is my current resume text:\n\n${resumeText}\n\n`;
    if (jobDescription) {
        prompt += `Here is the Target Job Description:\n\n${jobDescription}\n\nTailor the resume specifically to match this job description closely to maximize the ATS match rate.\n`;
    } else {
        prompt += `Optimize this resume to be highly professional, impactful, and ATS-friendly for its industry.\n`;
    }
    
    prompt += `Generate a perfectly formatted resume structured as a valid JSON object. Do not include markdown formatting or backticks. The JSON must exactly match this structure:
{
  "personal": {
    "name": "Full Name",
    "title": "Target Job Title",
    "email": "Email",
    "location": "City, Country",
    "phone": "Phone (if any)",
    "linkedin": "LinkedIn (if any)"
  },
  "summary": "A 3-4 sentence powerful professional summary tailored to the target role.",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "date": "Start - End Date",
      "description": ["High impact bullet point starting with an action verb", "Another bullet point"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "School Name",
      "year": "Graduation Year"
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "aiFeedback": {
    "atsScore": 85,
    "strengths": ["Strength 1", "Strength 2"],
    "improvements": ["Improvement 1", "Improvement 2"]
  }
}`;

    const sysInstruction = `You are an elite executive resume consultant and ATS algorithm expert. Output valid JSON only, without markdown wrappers. Ensure the resume sounds highly professional, quantifiable, and action-oriented.`;
    
    try {
        const resultText = await callGemini(prompt, sysInstruction);
        const cleaned = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleaned);
        res.json({ success: true, generated: data });
    } catch(e) {
        console.error("Resume generation failed:", e);
        res.status(500).json({ success: false, message: 'Failed to generate AI Resume' });
    }
});

// Learning AI Endpoint
router.get('/ai/learning/roadmap', auth, async (req, res) => {
    try {
        const profileRes = await pool.query('SELECT industry, role, resume_text FROM profiles WHERE user_id = $1', [req.user.id]);
        let context = "";
        if (profileRes.rows.length > 0) {
            const p = profileRes.rows[0];
            context += `User Role: ${p.role || 'Unknown'}\n`;
            context += `User Industry: ${p.industry || 'Unknown'}\n`;
            if (p.resume_text) {
                context += `User Resume Summary/Skills: ${p.resume_text.substring(0, 1000)}\n`;
            }
        } else {
            context = "User Profile: General Professional";
        }

        const prompt = `Based on the following user context, generate a learning roadmap to help them level up in their career.\n\n${context}\n\nFormat as JSON exactly like this:
{
    "roadmap": {
        "title": "Senior [Role] Roadmap",
        "checkpoint": "Next big milestone skill"
    },
    "courses": [
        {
            "tag": "Category (e.g. Architecture)",
            "title": "Course Title",
            "instructor": "Instructor Name • Title",
            "progress": 0,
            "tagClass": "badge-primary",
            "color": "var(--primary)"
        },
        {
            "tag": "Category (e.g. Design)",
            "title": "Course Title",
            "instructor": "Instructor Name • Title",
            "progress": 0,
            "tagClass": "badge-secondary",
            "color": "var(--secondary)"
        },
        {
            "tag": "Category (e.g. Soft Skills)",
            "title": "Course Title",
            "instructor": "Instructor Name • Title",
            "progress": 0,
            "tagClass": "badge-primary",
            "color": "var(--accent)"
        }
    ]
}
Provide exactly 3 recommended courses. Progress should be 0 since they are newly recommended.`;

        const sysInstruction = `You are an expert career coach AI. Output valid JSON only, without markdown wrappers.`;
        
        const resultText = await callGemini(prompt, sysInstruction);
        const cleaned = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleaned);
        
        res.json({ success: true, learningData: data });
    } catch (e) {
        console.error("Learning roadmap generation failed:", e);
        res.status(500).json({ success: false, message: 'Failed to generate AI roadmap' });
    }
});

router.post('/ai/resume/export-docx', auth, async (req, res) => {
    try {
        const { resumeData } = req.body;
        if (!resumeData) return res.status(400).send('Resume data is required');

        const children = [];

        // Personal Info
        if (resumeData.personal) {
            children.push(new Paragraph({
                text: resumeData.personal.name || 'Your Name',
                heading: HeadingLevel.HEADING_1,
                alignment: "center"
            }));
            
            const contact = [];
            if (resumeData.personal.email) contact.push(resumeData.personal.email);
            if (resumeData.personal.phone) contact.push(resumeData.personal.phone);
            if (resumeData.personal.location) contact.push(resumeData.personal.location);
            if (resumeData.personal.linkedin) contact.push(resumeData.personal.linkedin);
            
            children.push(new Paragraph({
                text: contact.join(' | '),
                alignment: "center",
                spacing: { after: 200 }
            }));
        }

        // Summary
        if (resumeData.summary) {
            children.push(new Paragraph({ text: "Professional Summary", heading: HeadingLevel.HEADING_2 }));
            children.push(new Paragraph({ text: resumeData.summary, spacing: { after: 200 } }));
        }

        // Experience
        if (resumeData.experience && resumeData.experience.length > 0) {
            children.push(new Paragraph({ text: "Experience", heading: HeadingLevel.HEADING_2 }));
            resumeData.experience.forEach(exp => {
                children.push(new Paragraph({
                    children: [
                        new TextRun({ text: exp.title || '', bold: true }),
                        new TextRun({ text: ` | ${exp.company || ''}`, italics: true }),
                    ]
                }));
                if (exp.date) {
                    children.push(new Paragraph({ text: exp.date, spacing: { after: 100 } }));
                }
                
                if (exp.description && exp.description.length > 0) {
                    exp.description.forEach(bullet => {
                        children.push(new Paragraph({
                            text: bullet,
                            bullet: { level: 0 }
                        }));
                    });
                }
                children.push(new Paragraph({ text: "", spacing: { after: 100 } })); // Spacer
            });
        }

        // Education
        if (resumeData.education && resumeData.education.length > 0) {
            children.push(new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_2 }));
            resumeData.education.forEach(edu => {
                children.push(new Paragraph({
                    children: [
                        new TextRun({ text: edu.degree || '', bold: true }),
                        new TextRun({ text: ` - ${edu.school || ''}` }),
                    ]
                }));
                if (edu.year) {
                    children.push(new Paragraph({ text: edu.year, spacing: { after: 100 } }));
                }
            });
        }

        // Skills
        if (resumeData.skills && resumeData.skills.length > 0) {
            children.push(new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_2 }));
            children.push(new Paragraph({ text: resumeData.skills.join(', '), spacing: { after: 200 } }));
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: children
            }]
        });

        const b64string = await Packer.toBase64String(doc);
        const buffer = Buffer.from(b64string, 'base64');
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename=GigFlow_Resume.docx');
        res.send(buffer);
    } catch (e) {
        console.error("DOCX export error:", e);
        res.status(500).send("Failed to export DOCX");
    }
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
    const { jobTitle, companyName, profileSummary, jobId } = req.body;
    
    try {
        // Fetch user resume text and profile details for deep context
        const profileRes = await pool.query('SELECT resume_text, skills, experience_level FROM profiles WHERE user_id = $1', [req.user.id]);
        const profile = profileRes.rows[0] || {};
        
        let jobDetails = '';
        if (jobId) {
            const jobRes = await pool.query('SELECT title, description FROM jobs WHERE id = $1', [jobId]);
            if (jobRes.rows.length > 0) {
                jobDetails = `Job Title: ${jobRes.rows[0].title}\nJob Description:\n${jobRes.rows[0].description}`;
            }
        } else if (jobTitle && companyName) {
            jobDetails = `Job Title: ${jobTitle} at ${companyName}`;
        }

        const contextPrompt = `
        User Resume Text:\n${profile.resume_text || 'None uploaded'}\n
        User Bio/Summary:\n${profileSummary || 'None provided'}\n
        User Experience Level: ${profile.experience_level || 'Not provided'}\n
        User Skills: ${profile.skills ? profile.skills.join(', ') : 'Not provided'}\n
        Target Job Context:\n${jobDetails || 'Not provided'}\n
        
        Write an elite, highly personalized cover letter tailored specifically to the user's credentials and the target job description. The tone should be extremely professional, high-impact, and organic (avoiding robotic AI platitudes).
        `;

        const letter = await callGemini(contextPrompt, 'You are an expert executive coach. Draft a compelling cover letter that maps the candidate\'s achievements directly to the job needs.');

        // Save generated letter in history automatically
        const id = require('crypto').randomUUID();
        const saveTitle = `Cover Letter - ${jobTitle || 'General'} (${companyName || 'Application'})`;
        await pool.query(
            `INSERT INTO cover_letters (id, user_id, job_id, title, content) 
             VALUES ($1, $2, $3, $4, $5)`,
            [id, req.user.id, jobId || null, saveTitle, letter]
        );

        res.json({ success: true, letter, id });
    } catch (e) {
        console.error('AI Cover Letter Generation failed:', e.message);
        res.status(500).json({ success: false, message: 'Failed to generate cover letter.' });
    }
});

// ==========================================
// COVER LETTER DATABASE CRUD
// ==========================================
router.get('/cover-letters', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT cl.*, j.title as job_title, c.name as company_name 
             FROM cover_letters cl
             LEFT JOIN jobs j ON cl.job_id = j.id
             LEFT JOIN companies c ON j.company_id = c.id
             WHERE cl.user_id = $1
             ORDER BY cl.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, coverLetters: result.rows });
    } catch (err) {
        console.error('Fetch cover letters error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/ai/cover-letter/export-docx', auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).send('Cover letter content is required');

        const paragraphs = content.split('\n').map(text => {
            return new Paragraph({
                text: text.trim(),
                spacing: { after: 200 }
            });
        });

        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs
            }]
        });

        const b64string = await Packer.toBase64String(doc);
        const buffer = Buffer.from(b64string, 'base64');
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename=GigFlow_Cover_Letter.docx');
        res.send(buffer);
    } catch (e) {
        console.error("Cover Letter DOCX export error:", e);
        res.status(500).send("Failed to export DOCX");
    }
});

router.post('/cover-letters', auth, async (req, res) => {
    const { jobId, title, content } = req.body;
    if (!content) {
        return res.status(400).json({ success: false, message: 'Cover letter content is required' });
    }
    try {
        const id = require('crypto').randomUUID();
        const result = await pool.query(
            `INSERT INTO cover_letters (id, user_id, job_id, title, content) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [id, req.user.id, jobId || null, title || 'Untitled Cover Letter', content]
        );
        res.status(201).json({ success: true, coverLetter: result.rows[0], message: 'Cover letter saved!' });
    } catch (err) {
        console.error('Save cover letter error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.put('/cover-letters/:id', auth, async (req, res) => {
    const { title, content } = req.body;
    if (!content) {
        return res.status(400).json({ success: false, message: 'Cover letter content is required' });
    }
    try {
        const result = await pool.query(
            `UPDATE cover_letters 
             SET title = COALESCE($1, title), 
                 content = $2, 
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3 AND user_id = $4 
             RETURNING *`,
            [title, content, req.params.id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Cover letter not found' });
        }
        res.json({ success: true, coverLetter: result.rows[0], message: 'Cover letter updated!' });
    } catch (err) {
        console.error('Update cover letter error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.delete('/cover-letters/:id', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM cover_letters WHERE id = $1 AND user_id = $2 RETURNING *`,
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Cover letter not found' });
        }
        res.json({ success: true, message: 'Cover letter deleted successfully!' });
    } catch (err) {
        console.error('Delete cover letter error:', err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
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

// ==========================================
// SECURE GLOBAL JOBS API (Proxy for Indeed/CareerJet)
// ==========================================
router.get('/jobs/search', auth, async (req, res) => {
    const { q = 'developer', location = 'Remote', page = 1 } = req.query;
    
    // Check if the server has configured a real API key in .env (keeping it private from frontend)
    const careerjetKey = process.env.CAREERJET_API_KEY;
    const indeedKey = process.env.INDEED_PUBLISHER_ID;

    try {
        if (careerjetKey) {
            // Live CareerJet Integration (Private & Secure)
            const response = await fetch(`https://www.careerjet.com/partners/api/?keywords=${encodeURIComponent(q)}&location=${encodeURIComponent(location)}&page=${page}&affid=${careerjetKey}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            return res.json({ success: true, source: 'careerjet', jobs: data.jobs || [] });
        } else if (indeedKey) {
            // Live Indeed Integration (Private & Secure)
            const response = await fetch(`https://www.indeed.com/publisher?publisher=${indeedKey}&q=${encodeURIComponent(q)}&l=${encodeURIComponent(location)}&v=2&format=json`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            return res.json({ success: true, source: 'indeed', jobs: data.results || [] });
        } else {
            // Fallback mock realistic data for development if keys are not present
            const mockJobs = [
                { id: '1', title: \`Senior \${q || 'Software'} Engineer\`, company: 'TechCorp Global', location: location || 'Remote', type: 'Full-time', salary: '$120k - $150k', posted: '2 days ago', description: 'Lead the development of scalable applications.', is_applied: false },
                { id: '2', title: \`Mid-level \${q || 'Frontend'} Developer\`, company: 'StartupX', location: location || 'Remote', type: 'Contract', salary: '$90k - $110k', posted: '5 hours ago', description: 'Build beautiful UIs with React and Node.js.', is_applied: true },
                { id: '3', title: \`\${q || 'Product'} Manager\`, company: 'Innovate LLC', location: 'New York, NY (Hybrid)', type: 'Full-time', salary: '$130k - $160k', posted: '1 week ago', description: 'Drive product strategy and execution.', is_applied: false }
            ];
            return res.json({ success: true, source: 'mock', jobs: mockJobs });
        }
    } catch (err) {
        console.error('Jobs Search API error:', err.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ==========================================
// RESUME EXPORT DOCX
// ==========================================
router.post('/resume/export-docx', auth, async (req, res) => {
    try {
        const data = req.body;
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({ text: data.name || 'Your Name', heading: HeadingLevel.HEADING_1 }),
                    new Paragraph({ text: data.title || 'Job Title', heading: HeadingLevel.HEADING_2 }),
                    new Paragraph({ text: `${data.email || ''} | ${data.location || ''}` }),
                    new Paragraph({ text: '' }),
                    new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_3 }),
                    new Paragraph({ text: data.summary || '' }),
                    new Paragraph({ text: '' }),
                    new Paragraph({ text: 'Experience', heading: HeadingLevel.HEADING_3 }),
                    ...(data.experience || []).flatMap(exp => [
                        new Paragraph({ children: [new TextRun({ text: exp.title + ' | ' + exp.company, bold: true })] }),
                        new Paragraph({ text: exp.responsibilities || '' }),
                        new Paragraph({ text: '' })
                    ]),
                    new Paragraph({ text: 'Skills', heading: HeadingLevel.HEADING_3 }),
                    new Paragraph({ text: data.skills || '' }),
                ],
            }],
        });

        const buffer = await Packer.toBuffer(doc);
        res.setHeader('Content-Disposition', 'attachment; filename=Resume.docx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.send(buffer);
    } catch (err) {
        console.error('DOCX Export error:', err);
        res.status(500).send('Error generating DOCX');
    }
});
// ==========================================
// AI INTERVIEW CENTER
// ==========================================
router.post('/ai/interview/chat', auth, async (req, res) => {
    try {
        const { messages, role, mode } = req.body;
        
        let systemPrompt = `You are an AI interviewer representing a company. You are conducting an interview for the role of ${role}.
        The interview mode is ${mode} (if audio, keep answers shorter and conversational. If typing, you can be slightly more detailed but keep it to one or two paragraphs max).
        You should act professionally, ask insightful technical or behavioral questions relevant to the role, and respond to the candidate's answers.
        Do not output any markdown formatting or special characters if in audio mode, just plain text.
        Your goal is to evaluate the candidate and ask 3-5 questions before ending the interview.
        Always respond in character. Do not break character.`;

        // Format history for Gemini
        const chatHistory = messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));

        // Call Gemini
        const promptText = `System Prompt: ${systemPrompt}\n\nPlease provide your next response as the interviewer.`;
        if (chatHistory.length > 0) {
            chatHistory[chatHistory.length - 1].parts[0].text += `\n\n${promptText}`;
        } else {
            chatHistory.push({ role: 'user', parts: [{ text: promptText }] });
        }

        let aiText = "Thank you for joining. Let's start the interview.";
        try {
            aiText = await callGemini(chatHistory[chatHistory.length - 1].parts[0].text);
        } catch (e) {
            console.error('Gemini error:', e);
            aiText = "Can you tell me more about your experience?";
        }

        res.json({ success: true, text: aiText });
    } catch (err) {
        console.error('AI Interview error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
