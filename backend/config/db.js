const { Pool } = require('pg');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let pgPool = null;
let sqliteDb = null;
let dbType = 'postgres'; // 'postgres' or 'sqlite'

// Attempt to check if PG is configured and running
const isPgConfigured = process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost:5432');

if (isPgConfigured) {
    try {
        pgPool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        console.log('🔌 PostgreSQL database pool initialized.');
    } catch (e) {
        console.warn('⚠️ Failed to initialize PostgreSQL pool, falling back to SQLite:', e.message);
        dbType = 'sqlite';
    }
} else {
    console.warn('⚠️ PostgreSQL URL not fully configured for remote access, checking local database.');
    // Test local PG connection briefly
    pgPool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
        connectionTimeoutMillis: 2000
    });
}

// Function to initialize SQLite
function initSqlite() {
    dbType = 'sqlite';
    const dbPath = path.join(__dirname, '../gigflow.db');
    console.log(`💾 Falling back to local SQLite database at: ${dbPath}`);
    
    sqliteDb = new sqlite3.Database(dbPath);
    
    // Create relational tables for SQLite
    sqliteDb.serialize(() => {
        // Users Table
        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                is_verified INTEGER DEFAULT 0,
                auth_provider TEXT DEFAULT 'local',
                oauth_id TEXT,
                verification_token TEXT,
                reset_token TEXT,
                reset_token_expiry TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Profiles Table
        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS profiles (
                user_id TEXT PRIMARY KEY,
                full_name TEXT NOT NULL,
                profile_picture TEXT,
                industry TEXT,
                skills TEXT, -- Stored as JSON string
                experience_level TEXT,
                country TEXT,
                city TEXT,
                resume_url TEXT,
                resume_filename TEXT,
                resume_text TEXT,
                portfolio_url TEXT,
                portfolio_filename TEXT,
                portfolio_metadata TEXT,
                linkedin_url TEXT,
                career_interests TEXT, -- Stored as JSON string
                role TEXT,
                resume_builder_data TEXT,
                is_complete INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        sqliteDb.run(`ALTER TABLE profiles ADD COLUMN role TEXT`, () => {});
        sqliteDb.run(`ALTER TABLE profiles ADD COLUMN resume_builder_data TEXT`, () => {});
        sqliteDb.run(`ALTER TABLE profiles ADD COLUMN is_complete INTEGER DEFAULT 0`, () => {});

        // Companies Table
        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS companies (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                industry TEXT,
                website TEXT,
                logo_url TEXT,
                location TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Jobs Table
        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                company_id TEXT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                type TEXT NOT NULL,
                location TEXT,
                is_remote INTEGER DEFAULT 0,
                salary_range TEXT,
                status TEXT DEFAULT 'open',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
            )
        `);

        // Applications Table
        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS applications (
                id TEXT PRIMARY KEY,
                job_id TEXT,
                user_id TEXT,
                cover_letter TEXT,
                status TEXT DEFAULT 'pending',
                ai_match_score INTEGER,
                custom_job_title TEXT,
                custom_company_name TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(job_id, user_id)
            )
        `);

        // Cover Letters Table
        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS cover_letters (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                job_id TEXT,
                title TEXT,
                content TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Saved Jobs Table
        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS saved_jobs (
                user_id TEXT,
                job_id TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, job_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
            )
        `);

        // Notifications Table
        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Messages Table
        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                sender_id TEXT,
                receiver_id TEXT,
                content TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Learning Progress Table
        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS learning_progress (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                course_title TEXT NOT NULL,
                status TEXT DEFAULT 'in-progress',
                progress_percent INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // AI History Table
        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS ai_history (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                type TEXT NOT NULL,
                input TEXT,
                output TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Career Analytics Table
        sqliteDb.run(`
            CREATE TABLE IF NOT EXISTS career_analytics (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                profile_views INTEGER DEFAULT 0,
                applications_count INTEGER DEFAULT 0,
                skills_match_ratio REAL DEFAULT 0.00,
                weekly_activity_score INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Seed Seed Data if Companies empty
        sqliteDb.get("SELECT COUNT(*) as count FROM companies", (err, row) => {
            if (row && row.count === 0) {
                console.log("🌱 Seeding default companies & jobs into SQLite...");
                sqliteDb.run(`
                    INSERT INTO companies (id, name, description, industry, website, logo_url, location) VALUES
                    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'TechFlow Solutions', 'Next generation cloud software developer platforms.', 'Software Development', 'https://techflow.dev', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg', 'Nairobi, Kenya'),
                    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Apex AI Lab', 'Specialized laboratory researching artificial intelligence models.', 'Artificial Intelligence', 'https://apex.ai', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/codepen/codepen-original.svg', 'San Francisco, CA'),
                    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Global Health Corp', 'Modern healthcare systems integration.', 'Healthcare', 'https://globalhealth.org', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firefox/firefox-original.svg', 'London, UK'),
                    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Nexa Finance', 'Digital banking and micro-insurance apps.', 'Finance', 'https://nexafinance.com', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/safari/safari-original.svg', 'Cape Town, SA')
                `);

                sqliteDb.run(`
                    INSERT INTO jobs (id, company_id, title, description, type, location, is_remote, salary_range) VALUES
                    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Senior Full-Stack Engineer', 'Looking for an experienced JavaScript Node.js / React developer. Must understand database design and REST APIs.', 'Full-Time', 'Nairobi, Kenya', 1, 'Ksh 350,000 - 450,000'),
                    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'AI Research Scientist', 'Train and fine-tune large language models. Experience with Python, PyTorch, and NLP models is required.', 'Full-Time', 'San Francisco, CA', 0, '$150,000 - $180,000'),
                    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Healthcare Data Analyst', 'Analyze clinical data flows. Experience with SQL and Tableau is required.', 'Part-Time', 'London, UK', 1, '£40,000 - £50,000'),
                    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'UI/UX Mobile Designer', 'Design elegant banking apps. Must be proficient in Figma, micro-animations, and responsive design systems.', 'Freelance', 'Cape Town, SA', 1, '$50 - $70 / hour')
                `);
            }
        });
    });
}

// Wrapper DB object
const db = {
    getDbType: () => dbType,
    
    query: (text, params = []) => {
        return new Promise((resolve, reject) => {
            if (dbType === 'postgres') {
                pgPool.query(text, params, (err, res) => {
                    if (err) {
                        // If PostgreSQL fails to connect mid-run, let's gracefully switch to SQLite on the fly!
                        if (err.code === 'ECONNREFUSED' || err.message.includes('connect')) {
                            console.error('❌ Lost connection to PostgreSQL. Switching database to local SQLite...');
                            initSqlite();
                            // Re-run query on SQLite
                            return resolve(db.query(text, params));
                        }
                        return reject(err);
                    }
                    resolve(res);
                });
            } else {
                // SQLite execution path
                // Translate syntax: ILIKE -> LIKE, $1 -> ?
                let sql = text.replace(/ILIKE/g, 'LIKE').replace(/\$\d+/g, '?');
                
                // SQLite array handling: profiles skills/interests arrays
                const mappedParams = params.map(p => {
                    if (Array.isArray(p)) {
                        return JSON.stringify(p);
                    }
                    if (typeof p === 'boolean') {
                        return p ? 1 : 0;
                    }
                    return p;
                });

                const isInsertOrUpdate = sql.trim().toUpperCase().startsWith('INSERT') || 
                                         sql.trim().toUpperCase().startsWith('UPDATE') ||
                                         sql.trim().toUpperCase().startsWith('DELETE');

                if (isInsertOrUpdate) {
                    sqliteDb.all(sql, mappedParams, (err, rows) => {
                        if (err) return reject(err);
                        
                        // Parse JSON fields back to arrays
                        const processedRows = (rows || []).map(row => {
                            if (row.skills && typeof row.skills === 'string') {
                                try { row.skills = JSON.parse(row.skills); } catch(e){}
                            }
                            if (row.career_interests && typeof row.career_interests === 'string') {
                                try { row.career_interests = JSON.parse(row.career_interests); } catch(e){}
                            }
                            return row;
                        });

                        resolve({ rows: processedRows, rowCount: processedRows.length });
                    });
                } else {
                    sqliteDb.all(sql, mappedParams, (err, rows) => {
                        if (err) return reject(err);

                        // Parse JSON fields back to arrays
                        const processedRows = (rows || []).map(row => {
                            if (row.skills && typeof row.skills === 'string') {
                                try { row.skills = JSON.parse(row.skills); } catch(e){}
                            }
                            if (row.career_interests && typeof row.career_interests === 'string') {
                                try { row.career_interests = JSON.parse(row.career_interests); } catch(e){}
                            }
                            return row;
                        });

                        resolve({ rows: processedRows, rowCount: processedRows.length });
                    });
                }
            }
        });
    }
};

// Initialize connectivity checks
if (dbType === 'postgres') {
    pgPool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('❌ Local PostgreSQL database is offline or failed. Error details:', err.message);
            initSqlite();
        } else {
            console.log('✅ PostgreSQL database successfully connected.');
        }
    });
}

module.exports = db;
