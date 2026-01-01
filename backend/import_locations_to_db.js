const fs = require('fs');
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'abacha',
  password: process.env.DB_PASSWORD || 'your_password',
  port: process.env.DB_PORT || 5432,
});

async function importLocations() {
  const client = await pool.connect();

  try {
    console.log('Reading locations.json file...');
    const locationsData = JSON.parse(fs.readFileSync('./locations.json', 'utf8'));
    const locations = locationsData.locations;

    console.log(`Found ${locations.length} locations to import`);

    await client.query('BEGIN');

    // Create locations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        type VARCHAR(50) DEFAULT 'dormitory',
        marker_color VARCHAR(20),
        source VARCHAR(50),
        osm_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Locations table ready');

    // Add location_id to users table if it doesn't exist
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS location_id INT REFERENCES locations(id);
    `);

    console.log('Users table updated with location_id column');

    let imported = 0;
    let skipped = 0;

    for (const location of locations) {
      try {
        await client.query(`
          INSERT INTO locations (name, latitude, longitude, type, marker_color, source, osm_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (name) DO UPDATE SET
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            type = EXCLUDED.type,
            marker_color = EXCLUDED.marker_color,
            source = EXCLUDED.source,
            osm_id = EXCLUDED.osm_id
        `, [
          location.name,
          location.latitude,
          location.longitude,
          location.type,
          location.marker_color || null,
          location.source || 'osm',
          location.id || null
        ]);
        imported++;
      } catch (err) {
        console.error(`Error importing ${location.name}:`, err.message);
        skipped++;
      }
    }

    await client.query('COMMIT');

    console.log(`\nImport complete!`);
    console.log(`- Imported/Updated: ${imported} locations`);
    console.log(`- Skipped: ${skipped} locations`);

    // Show statistics
    const stats = await client.query(`
      SELECT type, COUNT(*) as count
      FROM locations
      GROUP BY type
      ORDER BY count DESC
    `);

    console.log('\nLocation statistics by type:');
    stats.rows.forEach(row => {
      console.log(`  ${row.type}: ${row.count}`);
    });

    // Show hostel/dormitory locations
    const hostels = await client.query(`
      SELECT id, name, latitude, longitude
      FROM locations
      WHERE type IN ('dormitory', 'hostel')
      ORDER BY name
    `);

    console.log(`\nFound ${hostels.rows.length} hostels/dormitories:`);
    hostels.rows.forEach(hostel => {
      console.log(`  [${hostel.id}] ${hostel.name} (${hostel.latitude}, ${hostel.longitude})`);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error importing locations:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the import
importLocations()
  .then(() => {
    console.log('\n✓ Import completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the imported locations');
    console.log('2. Run the update_user_locations.sql script to assign users to hostels');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Import failed:', error);
    process.exit(1);
  });
