const db = require('./src/config/database');
const fs = require('fs');

async function runMigration() {
  try {
    const sql = fs.readFileSync('./migrations/011_merchant_payments.sql', 'utf8');
    await db.query(sql);
    console.log('✅ Merchant payment tables created successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
