const db = require('./src/config/database');

async function checkDates() {
  try {
    const result = await db.query(`
      SELECT
        MIN(DATE(created_at)) as earliest_date,
        MAX(DATE(created_at)) as latest_date,
        COUNT(DISTINCT DATE(created_at)) as day_count,
        COUNT(*) as total_orders
      FROM orders
      WHERE merchant_id = 3 AND order_status = 'delivered'
    `);
    console.log('[OK] Orders in database:');
    console.log(result.rows[0]);

    console.log('\n[OK] Sample orders:');
    const sample = await db.query(`
      SELECT id, created_at, DATE(created_at) as order_date
      FROM orders
      WHERE merchant_id = 3 AND order_status = 'delivered'
      ORDER BY created_at ASC
      LIMIT 10
    `);
    sample.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Date: ${row.order_date}`);
    });

  } catch(err) {
    console.error('[ERROR]', err.message);
  }
}

checkDates().then(() => process.exit(0));
