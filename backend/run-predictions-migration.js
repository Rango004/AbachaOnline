const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wego_dev'
});

async function runMigrations() {
  try {
    const migrations = [
      '020_create_sales_predictions.sql',
      '021_create_holidays_events.sql'
    ];

    for (const migration of migrations) {
      const migrationPath = path.join(__dirname, `database/migrations/${migration}`);

      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  Migration file not found: ${migration}`);
        continue;
      }

      const sql = fs.readFileSync(migrationPath, 'utf8');

      console.log(`\n⏳ Running migration: ${migration}`);
      await pool.query(sql);
      console.log(`✅ Migration executed successfully: ${migration}`);
    }

    console.log('\n✅ All migrations completed successfully!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    if (err.detail) console.error('Details:', err.detail);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
