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
    
    await client.query('BEGIN');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        type VARCHAR(50) DEFAULT 'dormitory',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await client.query(`
      ALTER TABLE locations 
      ADD COLUMN IF NOT EXISTS marker_color VARCHAR(20),
      ADD COLUMN IF NOT EXISTS source VARCHAR(50),
      ADD COLUMN IF NOT EXISTS osm_id VARCHAR(100);
    `);
    
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS location_id INT REFERENCES locations(id);
    `);
    
    let imported = 0;
    for (const location of locationsData.locations) {
      try {
        await client.query(`
          INSERT INTO locations (name, latitude, longitude, type, marker_color, source, osm_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (name) DO UPDATE SET
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            type = EXCLUDED.type
        `, [
          location.name,
          location.latitude,
          location.longitude,
          location.type,
          location.marker_color,
          location.source || 'osm',
          location.id
        ]);
        imported++;
      } catch (err) {
        console.error(`Error importing ${location.name}:`, err.message);
      }
    }
    
    await client.query('COMMIT');
    
    const stats = await client.query(`
      SELECT type, COUNT(*) as count FROM locations GROUP BY type ORDER BY count DESC
    `);
    
    console.log(`✓ Imported ${imported} locations`);
    console.log('Location types:');
    stats.rows.forEach(row => console.log(`  ${row.type}: ${row.count}`));
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedLocations();