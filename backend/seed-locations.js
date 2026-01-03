/**
 * Seed Locations Data
 * Adds sample dormitory/campus locations if the table is empty
 */

const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: No database connection string provided');
  console.log('\nPlease set DATABASE_URL in your .env file\n');
  process.exit(1);
}

console.log('🔄 Connecting to database...');

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Sample location data - Update these with actual campus locations
const locations = [
  {
    name: 'Main Campus Hall',
    latitude: 8.4657,
    longitude: -13.2317,
    type: 'dormitory',
    description: 'Main student dormitory building'
  },
  {
    name: 'Block A - Student Hostel',
    latitude: 8.4660,
    longitude: -13.2320,
    type: 'dormitory',
    description: 'Block A student accommodation'
  },
  {
    name: 'Block B - Student Hostel',
    latitude: 8.4655,
    longitude: -13.2315,
    type: 'dormitory',
    description: 'Block B student accommodation'
  },
  {
    name: 'Block C - Student Hostel',
    latitude: 8.4652,
    longitude: -13.2322,
    type: 'dormitory',
    description: 'Block C student accommodation'
  },
  {
    name: 'Graduate Student Housing',
    latitude: 8.4648,
    longitude: -13.2310,
    type: 'dormitory',
    description: 'Graduate student residence'
  },
  {
    name: 'Off-Campus Housing Area 1',
    latitude: 8.4665,
    longitude: -13.2325,
    type: 'off_campus',
    description: 'Off-campus student housing zone 1'
  },
  {
    name: 'Off-Campus Housing Area 2',
    latitude: 8.4640,
    longitude: -13.2305,
    type: 'off_campus',
    description: 'Off-campus student housing zone 2'
  },
  {
    name: 'Campus Library',
    latitude: 8.4658,
    longitude: -13.2318,
    type: 'academic',
    description: 'Main campus library - delivery point'
  },
  {
    name: 'Student Center',
    latitude: 8.4656,
    longitude: -13.2316,
    type: 'common_area',
    description: 'Student center - central meeting point'
  },
  {
    name: 'Sports Complex',
    latitude: 8.4662,
    longitude: -13.2314,
    type: 'facility',
    description: 'Campus sports and recreation center'
  }
];

async function seedLocations() {
  const client = await pool.connect();

  try {
    console.log('✅ Connected to database\n');

    // Check if locations already exist
    const checkResult = await client.query('SELECT COUNT(*) as count FROM locations');
    const existingCount = parseInt(checkResult.rows[0].count);

    if (existingCount > 0) {
      console.log(`ℹ️  Locations table already has ${existingCount} entries`);
      console.log('\nOptions:');
      console.log('  1. Keep existing data (no changes)');
      console.log('  2. Add sample data anyway (will create duplicates if names match)');
      console.log('  3. Clear existing data and seed fresh (⚠️  destructive)\n');
      console.log('To proceed with option 2 or 3, modify this script and re-run.');
      console.log('Current mode: Safe - exiting without changes\n');
      return;
    }

    console.log('📝 Seeding locations data...\n');

    await client.query('BEGIN');

    for (const location of locations) {
      const result = await client.query(
        `INSERT INTO locations (name, latitude, longitude, type, description)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name`,
        [location.name, location.latitude, location.longitude, location.type, location.description]
      );

      console.log(`✅ Added: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
    }

    await client.query('COMMIT');

    console.log(`\n✅ Successfully seeded ${locations.length} locations!`);

    // Verify
    const finalCount = await client.query('SELECT COUNT(*) as count FROM locations');
    console.log(`📊 Total locations in database: ${finalCount.rows[0].count}\n`);

    // Show sample of what was added
    const sample = await client.query('SELECT id, name, type FROM locations LIMIT 5');
    console.log('Sample of added locations:');
    sample.rows.forEach(loc => {
      console.log(`   ${loc.id}. ${loc.name} (${loc.type})`);
    });
    console.log('');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seeding failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seeding
seedLocations().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
