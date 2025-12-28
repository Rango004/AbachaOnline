const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'wego_dev'
});

async function checkLocations() {
  try {
    // Check table structure
    const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'locations'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📍 Locations Table Schema:');
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check data count
    const countResult = await pool.query('SELECT COUNT(*) as count FROM locations');
    const count = countResult.rows[0].count;
    console.log(`\n📊 Total Locations: ${count}`);
    
    if (count > 0) {
      // Show sample locations
      const sampleResult = await pool.query(
        'SELECT id, name, latitude, longitude FROM locations LIMIT 5'
      );
      console.log('\n📌 Sample Locations:');
      sampleResult.rows.forEach(row => {
        console.log(`  [${row.id}] ${row.name} (${row.latitude}, ${row.longitude})`);
      });
    } else {
      console.log('\n⚠️  No locations found in database!');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkLocations();
