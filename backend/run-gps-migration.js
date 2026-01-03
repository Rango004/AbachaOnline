/**
 * GPS Feature Migration Runner
 * Adds latitude and longitude columns to student_addresses table
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get PostgreSQL connection from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: No database connection string provided');
  console.log('\nPlease set DATABASE_URL in your .env file');
  console.log('Example: DATABASE_URL=postgresql://user:pass@host:port/database\n');
  process.exit(1);
}

console.log('🔄 Connecting to database...');

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('✅ Connected to database');
    console.log('📝 Reading migration file...\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '032_add_gps_to_addresses.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Start transaction
    await client.query('BEGIN');
    console.log('🔄 Starting transaction...');

    // Run migration
    console.log('🚀 Running GPS migration...');
    await client.query(migrationSQL);

    // Verify columns were added
    const checkColumns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'student_addresses'
      AND column_name IN ('latitude', 'longitude')
      ORDER BY column_name
    `);

    if (checkColumns.rows.length === 2) {
      console.log('\n✅ GPS columns added successfully:');
      checkColumns.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });
    } else {
      throw new Error('GPS columns were not created properly');
    }

    // Check for existing data in student_addresses
    const addressCount = await client.query(
      'SELECT COUNT(*) as count FROM student_addresses'
    );
    console.log(`\n📊 Current addresses in database: ${addressCount.rows[0].count}`);

    // Commit transaction
    await client.query('COMMIT');
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📌 Next steps:');
    console.log('   1. Update backend DeliveryAddressService.js (see GPS_FEATURE_IMPLEMENTATION.md)');
    console.log('   2. Update frontend DeliveryAddresses.jsx for GPS capture');
    console.log('   3. Test GPS location capture functionality\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
