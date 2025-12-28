const db = require('./src/config/database');

async function diagnose() {
  try {
    console.log('=== Diagnosing Forecast Issue ===\n');

    // Check what's in sales_predictions table
    console.log('[1] Checking sales_predictions table:');
    const predResult = await db.query(`
      SELECT
        COUNT(*) as count,
        COUNT(DISTINCT product_id) as products,
        MIN(prediction_date) as earliest,
        MAX(prediction_date) as latest
      FROM sales_predictions
      WHERE merchant_id = 3
    `);
    console.log('  - Total predictions:', predResult.rows[0].count);
    console.log('  - Products:', predResult.rows[0].products);
    console.log('  - Date range:', predResult.rows[0].earliest, 'to', predResult.rows[0].latest);

    // Sample predictions
    console.log('\n[2] Sample predictions:');
    const sampleResult = await db.query(`
      SELECT
        sp.product_id,
        p.name,
        sp.prediction_date,
        sp.predicted_quantity
      FROM sales_predictions sp
      JOIN products p ON sp.product_id = p.id
      WHERE sp.merchant_id = 3
      ORDER BY sp.prediction_date ASC
      LIMIT 10
    `);
    sampleResult.rows.forEach(row => {
      console.log(`  - ${row.name} on ${row.prediction_date}: ${row.predicted_quantity} units`);
    });

    // Check getWeeklyForecast query
    console.log('\n[3] Running getWeeklyForecast query manually:');
    const weeklyResult = await db.query(`
      SELECT
        DATE(sp.prediction_date) as prediction_date,
        SUM(sp.predicted_quantity) as daily_quantity,
        SUM(sp.predicted_quantity * p.price) as daily_revenue
      FROM sales_predictions sp
      JOIN products p ON sp.product_id = p.id
      WHERE sp.merchant_id = 3
        AND sp.prediction_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '14 days'
      GROUP BY DATE(sp.prediction_date)
      ORDER BY prediction_date
    `);
    console.log(`  - Results: ${weeklyResult.rows.length} rows`);
    if (weeklyResult.rows.length > 0) {
      console.log('  - First result:', weeklyResult.rows[0]);
    }

    // Check what CURRENT_DATE is in the database
    console.log('\n[4] Current date in database:');
    const dateResult = await db.query(`SELECT CURRENT_DATE as today, CURRENT_TIMESTAMP as now`);
    console.log('  - Today:', dateResult.rows[0].today);
    console.log('  - Now:', dateResult.rows[0].now);

  } catch(err) {
    console.error('[ERROR]', err.message);
    console.error(err.stack);
  }
}

diagnose().then(() => process.exit(0));
