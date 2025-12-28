require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  try {
    const migration = fs.readFileSync('./database/migrations/009_pickup_code_workflow.sql', 'utf8');
    await pool.query(migration);
    console.log('✅ Pickup code workflow migration completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();