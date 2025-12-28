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
    const migrationPath = path.join(__dirname, 'database/migrations/017_add_merchant_settings.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Running migration: 017_add_merchant_settings.sql');
    await pool.query(migrationSQL);
    console.log('✓ Migration completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  } finally {
    pool.end();
  }
}

runMigration();
