require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/wego_dev'
});

async function runMigration() {
  try {
    const migration = fs.readFileSync('./database/migrations/008_merchant_financial_tracking_safe.sql', 'utf8');
    const result = await pool.query(migration);
    console.log('✅ Safe migration completed successfully');
    console.log('✅ Merchant financial tracking ready');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();