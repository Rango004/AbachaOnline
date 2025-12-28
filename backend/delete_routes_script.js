const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'wego_dev',
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 2000,
  max: 5,
});

async function deleteRoutes() {
  const client = await pool.connect();
  try {
    console.log('Connected to database');

    // First, get the rider IDs
    const riderResult = await client.query(
      "SELECT id, phone FROM users WHERE phone IN ('+23231475452', '+23277040420')"
    );

    console.log(`Found ${riderResult.rows.length} riders:`);
    riderResult.rows.forEach(r => console.log(`  - ${r.id}: ${r.phone}`));

    // Count routes before deletion
    const countBefore = await client.query(
      'SELECT COUNT(*) as count FROM delivery_routes'
    );
    console.log(`\nRoutes before deletion: ${countBefore.rows[0].count}`);

    // Delete the routes
    const deleteResult = await client.query(
      `DELETE FROM delivery_routes
       WHERE rider_id IN (SELECT id FROM users WHERE phone IN ('+23231475452', '+23277040420'))`
    );

    console.log(`\nDeleted ${deleteResult.rowCount} routes`);

    // Count routes after deletion
    const countAfter = await client.query(
      'SELECT COUNT(*) as count FROM delivery_routes'
    );
    console.log(`Routes after deletion: ${countAfter.rows[0].count}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.release();
    await pool.end();
    process.exit(0);
  }
}

deleteRoutes();
