const db = require('./src/config/database');
const SalesPredictionService = require('./src/services/SalesPredictionService');

async function debugSalesHistory() {
  try {
    console.log('=== Testing getProductSalesHistory ===\n');

    // Test with product ID 1 (Jollof Rice)
    const salesHistory = await SalesPredictionService.getProductSalesHistory(1, 180);
    console.log('[DEBUG] Days returned from getProductSalesHistory(1, 180):',salesHistory.length);
    console.log('[DEBUG] First day:', salesHistory[0]);
    console.log('[DEBUG] Last day:', salesHistory[salesHistory.length - 1]);

    console.log('\n=== Checking what the forecast function sees ===\n');

    // Now check what the generateProductForecasts sees
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 180);
    console.log('[DEBUG] 180 days back from today:', startDate.toISOString().split('T')[0]);
    console.log('[DEBUG] Today:', new Date().toISOString().split('T')[0]);

    // Query like the function does
    const result = await db.query(`
      SELECT
        oi.product_id,
        p.name,
        DATE(o.created_at) as date,
        SUM(oi.quantity) as quantity
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE oi.product_id = 1
        AND o.order_status = 'delivered'
        AND o.created_at >= $1
      GROUP BY oi.product_id, p.name, DATE(o.created_at)
      ORDER BY date ASC
    `, [startDate]);

    console.log('[DEBUG] Query returned', result.rows.length, 'days of data for product 1');
    if (result.rows.length > 0) {
      console.log('[DEBUG] First row:', result.rows[0]);
      console.log('[DEBUG] Last row:', result.rows[result.rows.length - 1]);
    }

  } catch (err) {
    console.error('[ERROR]', err.message);
    console.error(err.stack);
  }
}

debugSalesHistory().then(() => process.exit(0));
