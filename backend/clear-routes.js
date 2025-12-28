/**
 * Clear pending and active routes for testing
 */

const db = require('./src/config/database');

async function clearRoutes() {
  console.log('═══════════════════════════════════════════════');
  console.log('Clearing Optimized Routes');
  console.log('═══════════════════════════════════════════════\n');

  try {
    // Get count before delete
    const beforeResult = await db.query(
      "SELECT COUNT(*) as count FROM delivery_routes WHERE status IN ('pending', 'active')"
    );
    const countBefore = beforeResult.rows[0].count;
    console.log(`📊 Routes before delete: ${countBefore}`);

    // Delete pending and active routes
    const deleteResult = await db.query(
      "DELETE FROM delivery_routes WHERE status IN ('pending', 'active')"
    );
    console.log(`🗑️  Routes deleted: ${deleteResult.rowCount}`);

    // Get count after delete
    const afterResult = await db.query(
      "SELECT COUNT(*) as count FROM delivery_routes WHERE status IN ('pending', 'active')"
    );
    const countAfter = afterResult.rows[0].count;
    console.log(`📊 Routes after delete: ${countAfter}`);

    console.log('\n✅ Routes cleared successfully!');
    console.log('\nYou can now generate fresh routes to test the new ETA features.');
    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error clearing routes:', error.message);
  } finally {
    process.exit(0);
  }
}

clearRoutes();
