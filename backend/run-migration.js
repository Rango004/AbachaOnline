const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'wego_dev'
});

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, 'database/migrations/016_create_student_addresses.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration: 016_create_student_addresses.sql');
    await pool.query(sql);
    console.log('✓ Migration executed successfully!');
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
