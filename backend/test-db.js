const pool = require('./config/db');

async function testConnection() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('PostgreSQL Connection Success:', res.rows[0]);
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Existing tables:', tables.rows.map(r => r.table_name));
        process.exit(0);
    } catch (err) {
        console.error('PostgreSQL Connection Failure:', err);
        process.exit(1);
    }
}

testConnection();
