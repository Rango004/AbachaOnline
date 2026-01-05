/**
 * Populate Hostel Locations from OSM Data
 *
 * This script extracts hostel locations from the Njala map OSM file
 * and populates them into the delivery_locations table.
 *
 * Run with: node backend/scripts/populate-hostel-locations.js
 */

const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Hostel locations extracted from Njala map updated.osm file
const hostelLocations = [
  { name: 'Quadrangle 1', latitude: 8.1138658, longitude: -12.0708755, description: 'Female hostel close to student union canteen' },
  { name: 'Quadrangle 2', latitude: 8.1139857, longitude: -12.0704704, description: 'Student hostel' },
  { name: 'Tourist', latitude: 8.1141939, longitude: -12.0701773, description: 'Student hostel' },
  { name: 'Winters Extension', latitude: 8.1144437, longitude: -12.0715245, description: 'Student hostel' },
  { name: 'TK. Jamaica', latitude: 8.1138974, longitude: -12.0682860, description: 'Student hostel' },
  { name: 'TK. Africa', latitude: 8.1140332, longitude: -12.0693395, description: 'Student hostel' },
  { name: 'TK. Asia', latitude: 8.1142495, longitude: -12.0693038, description: 'Student hostel' },
  { name: 'TK. America', latitude: 8.1141447, longitude: -12.0686472, description: 'Student hostel' },
  { name: 'TK. Europe', latitude: 8.1143499, longitude: -12.0686082, description: 'Student hostel' },
  { name: 'Postgrad & Medicine', latitude: 8.1164181, longitude: -12.0674767, description: 'Postgraduate and medical students hostel' },
  { name: 'Heavens 2', latitude: 8.1169224, longitude: -12.0674210, description: 'Student hostel' },
  { name: 'Heavens 1', latitude: 8.1174974, longitude: -12.0674132, description: 'Student hostel' },
  { name: 'Matturi Block C', latitude: 8.1183434, longitude: -12.0693430, description: 'Male hostel' },
  { name: 'Matturi Block B', latitude: 8.1183370, longitude: -12.0699996, description: 'Male hostel' },
  { name: 'Matturi Block H', latitude: 8.1188194, longitude: -12.0692962, description: 'Male hostel' },
  { name: 'Matturi Block A', latitude: 8.1188050, longitude: -12.0699399, description: 'Male hostel' },
  { name: 'Matturi Block F', latitude: 8.1192762, longitude: -12.0693139, description: 'Male hostel' },
  { name: 'Matturi Block E', latitude: 8.1188130, longitude: -12.0706562, description: 'Male hostel with 42 rooms' },
  { name: 'Matturi Block D', latitude: 8.1183699, longitude: -12.0706575, description: 'Female hostel' }
];

async function populateHostelLocations() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting hostel locations population...\n');

    // Start transaction
    await client.query('BEGIN');

    let insertedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    for (const hostel of hostelLocations) {
      try {
        // Check if location already exists
        const checkQuery = 'SELECT id, name FROM delivery_locations WHERE name = $1';
        const existingLocation = await client.query(checkQuery, [hostel.name]);

        if (existingLocation.rows.length > 0) {
          // Update existing location with GPS coordinates
          const updateQuery = `
            UPDATE delivery_locations
            SET latitude = $1,
                longitude = $2,
                description = $3,
                updated_at = NOW()
            WHERE name = $4
            RETURNING id, name
          `;
          const result = await client.query(updateQuery, [
            hostel.latitude,
            hostel.longitude,
            hostel.description,
            hostel.name
          ]);

          console.log(`✅ Updated: ${hostel.name} (ID: ${result.rows[0].id})`);
          updatedCount++;
        } else {
          // Insert new location
          const insertQuery = `
            INSERT INTO delivery_locations (name, latitude, longitude, description, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING id, name
          `;
          const result = await client.query(insertQuery, [
            hostel.name,
            hostel.latitude,
            hostel.longitude,
            hostel.description
          ]);

          console.log(`✅ Inserted: ${hostel.name} (ID: ${result.rows[0].id})`);
          insertedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${hostel.name}:`, error.message);
        skippedCount++;
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    console.log('\n📊 Summary:');
    console.log(`   ✅ Inserted: ${insertedCount}`);
    console.log(`   🔄 Updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   📍 Total Hostels: ${hostelLocations.length}`);
    console.log('\n✅ Hostel locations population completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error populating hostel locations:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  populateHostelLocations()
    .then(() => {
      console.log('\n👋 Script finished. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { populateHostelLocations, hostelLocations };
