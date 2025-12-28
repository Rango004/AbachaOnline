const db = require('./src/config/database');
const SalesPredictionService = require('./src/services/SalesPredictionService');

async function debugForecast() {
  try {
    console.log('=== STEP 1: Check active products ===');
    const productsResult = await db.query(`
      SELECT DISTINCT p.id, p.name, p.merchant_id, p.is_active
      FROM products p
      WHERE p.merchant_id = 3
      LIMIT 10
    `);
    console.log('[DEBUG] Total products found:', productsResult.rows.length);
    productsResult.rows.forEach(p => {
      console.log(`  - ${p.name} (ID: ${p.id}, active: ${p.is_active})`);
    });

    console.log('\n=== STEP 2: Check products with sufficient sales data ===');
    const salesResult = await db.query(`
      SELECT
        p.id,
        p.name,
        COUNT(DISTINCT DATE(o.created_at)) as days_with_sales
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.order_status = 'delivered'
      WHERE p.merchant_id = 3 AND p.is_active = true
      GROUP BY p.id, p.name
      HAVING COUNT(DISTINCT DATE(o.created_at)) >= 60
      ORDER BY days_with_sales DESC
    `);
    console.log('[DEBUG] Products with 60+ days of data:', salesResult.rows.length);
    salesResult.rows.forEach(p => {
      console.log(`  - ${p.name} (ID: ${p.id}, days: ${p.days_with_sales})`);
    });

    console.log('\n=== STEP 3: Trigger forecast generation ===');
    const result = await SalesPredictionService.generateProductForecasts(3);
    console.log('[OK] Forecast generation complete!');
    console.log('[OK] Total products:', result.summary.total);
    console.log('[OK] Successful:', result.summary.successful_count);
    console.log('[OK] Failed:', result.summary.failed_count);

    if (result.successful.length > 0) {
      console.log('\n=== First successful forecast ===');
      console.log('[OK] Product:', result.successful[0].product_name);
      console.log('[OK] Trend:', result.successful[0].trend);
      console.log('[OK] Method:', result.successful[0].forecast_method);
      console.log('[OK] Regressors used:', result.successful[0].regressors_used?.length || 0);
    }

    console.log('\n=== STEP 4: Check predictions in database ===');
    const predResult = await db.query(`
      SELECT COUNT(*) as count FROM sales_predictions WHERE merchant_id = 3
    `);
    console.log('[OK] Total predictions saved:', predResult.rows[0].count);

  } catch (err) {
    console.error('[ERROR]', err.message);
    console.error(err.stack);
  }
}

debugForecast().then(() => process.exit(0));
