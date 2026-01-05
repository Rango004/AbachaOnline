const fs = require('fs');
const { Pool } = require('pg');

const dbUrl = process.argv[2];
if (!dbUrl) {
  console.error('Usage: node seed-locations.js <database_url>');
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl });

async function seedLocations() {
  const client = await pool.connect();
  
  try {
    const locationsData = JSON.parse(fs.readFileSync('../locations.json', 'utf8'));
    
    // Clear existing locations
    await client.query('DELETE FROM locations');
    
    let imported = 0;
    for (const location of locationsData.locations) {
      try {
        await client.query(`
          INSERT INTO locations (name, latitude, longitude, type)
          VALUES ($1, $2, $3, $4)
        `, [
          location.name,
          location.latitude,
          location.longitude,
          location.type
        ]);
        imported++;
      } catch (err) {
        console.error(`Error importing ${location.name}:`, err.message);
      }
    }
    
    const stats = await client.query(`
      SELECT type, COUNT(*) as count FROM locations GROUP BY type ORDER BY count DESC
    `);
    
    console.log(`✓ Imported ${imported} locations`);
    console.log('Location types:');
    stats.rows.forEach(row => console.log(`  ${row.type}: ${row.count}`));
    
    const hostels = await client.query(`
      SELECT name FROM locations WHERE type = 'hostel' ORDER BY name LIMIT 10
    `);
    
    console.log(`\nSample hostels (${hostels.rows.length} total):`);
    hostels.rows.forEach(row => console.log(`  - ${row.name}`));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedLocations();