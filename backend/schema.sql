-- ==========================================
-- GigFlow PostgreSQL / Supabase Schema
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- USERS TABLE
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Nullable for OAuth-only users
    is_verified BOOLEAN DEFAULT FALSE,
    auth_provider VARCHAR(50) DEFAULT 'local', -- local, google, linkedin, microsoft
    oauth_id VARCHAR(255),
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PROFILES TABLE
-- ==========================================
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    profile_picture TEXT,
    industry VARCHAR(100),
    skills TEXT[],
    experience_level VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    resume_url TEXT,
    portfolio_url TEXT,
    linkedin_url TEXT,
    career_interests TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDUSTRIES TABLE
-- ==========================================
CREATE TABLE industries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SKILLS TABLE
-- ==========================================
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- COMPANIES TABLE (For Employer Module)
-- ==========================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    website TEXT,
    logo_url TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- EMPLOYERS TABLE
-- ==========================================
CREATE TABLE employers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'admin', -- admin, recruiter, member
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, company_id)
);

-- ==========================================
-- JOBS TABLE
-- ==========================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- Full-Time, Part-Time, Freelance, Internship
    location VARCHAR(255),
    is_remote BOOLEAN DEFAULT FALSE,
    salary_range VARCHAR(100),
    status VARCHAR(50) DEFAULT 'open', -- open, closed, draft
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- APPLICATIONS TABLE
-- ==========================================
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, shortlisted, rejected, hired
    ai_match_score INTEGER, -- Out of 100
    custom_job_title VARCHAR(255),
    custom_company_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, user_id)
);

-- ==========================================
-- SAVED JOBS TABLE
-- ==========================================
CREATE TABLE saved_jobs (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id)
);

-- ==========================================
-- NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- MESSAGES TABLE
-- ==========================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- LEARNING PROGRESS TABLE
-- ==========================================
CREATE TABLE learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'in-progress', -- in-progress, completed
    progress_percent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- AI HISTORY TABLE
-- ==========================================
CREATE TABLE ai_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- resume, cover-letter, coach, interview, ats-check
    input TEXT,
    output TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- CAREER ANALYTICS TABLE
-- ==========================================
CREATE TABLE career_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_views INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    skills_match_ratio NUMERIC(5,2) DEFAULT 0.00,
    weekly_activity_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_companies_modtime BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_employers_modtime BEFORE UPDATE ON employers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_jobs_modtime BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_applications_modtime BEFORE UPDATE ON applications FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_learning_progress_modtime BEFORE UPDATE ON learning_progress FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_career_analytics_modtime BEFORE UPDATE ON career_analytics FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Seed data for Industries
INSERT INTO industries (name) VALUES
('Accounting'), ('Administration'), ('Agriculture'), ('Architecture'), ('Artificial Intelligence'),
('Aviation'), ('Banking'), ('Biotechnology'), ('Business Consulting'), ('Construction'),
('Creative Arts'), ('Customer Service'), ('Cybersecurity'), ('Data Science'), ('Design'),
('Digital Marketing'), ('E-Commerce'), ('Education'), ('Engineering'), ('Energy'),
('Entertainment'), ('Environmental Science'), ('Fashion'), ('Finance'), ('Food & Beverage'),
('Government'), ('Graphic Design'), ('Healthcare'), ('Hospitality'), ('Human Resources'),
('Information Technology'), ('Insurance'), ('Journalism'), ('Legal'), ('Logistics'),
('Manufacturing'), ('Marketing'), ('Media'), ('Mining'), ('NGO'), ('Oil & Gas'),
('Pharmaceutical'), ('Product Management'), ('Project Management'), ('Public Relations'),
('Real Estate'), ('Renewable Energy'), ('Research'), ('Retail'), ('Robotics'),
('Sales'), ('Social Work'), ('Software Development'), ('Sports'), ('Supply Chain'),
('Telecommunications'), ('Tourism'), ('Transportation'), ('UI/UX Design'), ('Veterinary'),
('Video Production'), ('Web Development'), ('Writing & Editing'), ('Other')
ON CONFLICT DO NOTHING;

-- Seed Companies
INSERT INTO companies (id, name, description, industry, website, logo_url, location) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'TechFlow Solutions', 'Next generation cloud software developer platforms.', 'Software Development', 'https://techflow.dev', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg', 'Nairobi, Kenya'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Apex AI Lab', 'Specialized laboratory researching artificial intelligence models.', 'Artificial Intelligence', 'https://apex.ai', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/codepen/codepen-original.svg', 'San Francisco, CA'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Global Health Corp', 'Modern healthcare systems integration.', 'Healthcare', 'https://globalhealth.org', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firefox/firefox-original.svg', 'London, UK'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Nexa Finance', 'Digital banking and micro-insurance apps.', 'Finance', 'https://nexafinance.com', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/safari/safari-original.svg', 'Cape Town, SA')
ON CONFLICT (id) DO NOTHING;

-- Seed Jobs
INSERT INTO jobs (id, company_id, title, description, type, location, is_remote, salary_range) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Senior Full-Stack Engineer', 'Looking for an experienced JavaScript Node.js / React developer. Must understand database design and REST APIs.', 'Full-Time', 'Nairobi, Kenya', true, 'Ksh 350,000 - 450,000'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'AI Research Scientist', 'Train and fine-tune large language models. Experience with Python, PyTorch, and NLP models is required.', 'Full-Time', 'San Francisco, CA', false, '$150,000 - $180,000'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Healthcare Data Analyst', 'Analyze clinical data flows. Experience with SQL and Tableau is required.', 'Part-Time', 'London, UK', true, '£40,000 - £50,000'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'UI/UX Mobile Designer', 'Design elegant banking apps. Must be proficient in Figma, micro-animations, and responsive design systems.', 'Freelance', 'Cape Town, SA', true, '$50 - $70 / hour')
ON CONFLICT (id) DO NOTHING;
