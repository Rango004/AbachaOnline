/**
 * Load Synthetic Sales Data into Database
 *
 * This script loads the generated synthetic sales data for training the forecasting system.
 */

const db = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function loadSyntheticData() {
  console.log('====================================================================');
  console.log('Loading Synthetic Sales Data for Forecasting Training');
  console.log('====================================================================\n');

  try {
    // Read JSON file
    const jsonFile = path.join(__dirname, 'synthetic_sales_data.json');
    console.log(`[1/3] Reading synthetic data from ${jsonFile}...`);

    if (!fs.existsSync(jsonFile)) {
      console.error('[ERROR] synthetic_sales_data.json not found!');
      console.error('Run: python scripts/synthetic_data.py');
      process.exit(1);
    }

    const syntheticData = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
    const merchantId = 3; // Using merchant 3 from your database
    const studentId = 2; // Using student 2
    const unitPrice = 50; // Price per unit

    console.log(`[OK] Loaded data for ${Object.keys(syntheticData).length} products\n`);

    // Step 2: Get product IDs
    console.log('[2/3] Mapping product names to IDs...');

    const productMap = {};
    for (const [productName, data] of Object.entries(syntheticData)) {
      // Find product ID by name
      const result = await db.query(
        `SELECT id FROM products WHERE name = $1 AND merchant_id = $2`,
        [productName, merchantId]
      );

      if (result.rows.length > 0) {
        productMap[productName] = result.rows[0].id;
        console.log(`  ✓ ${productName} -> ID ${result.rows[0].id}`);
      } else {
        console.log(`  ✗ ${productName} -> NOT FOUND (skipping)`);
      }
    }

    console.log();

    // Step 3: Insert orders and order items
    console.log('[3/3] Inserting synthetic orders and items into database...');

    let orderId = 10000;
    let insertedOrders = 0;
    let insertedItems = 0;
    let skippedProducts = 0;

    for (const [productName, salesData] of Object.entries(syntheticData)) {
      const productId = productMap[productName];

      if (!productId) {
        skippedProducts++;
        continue;
      }

      // Insert order for each day
      for (const dayData of salesData) {
        const date = dayData.date;
        const quantity = dayData.quantity;
        const totalAmount = quantity * unitPrice;

        try {
          // Insert order
          await db.query(
            `INSERT INTO orders (id, student_id, merchant_id, total_amount, order_status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $6)
             ON CONFLICT (id) DO NOTHING`,
            [orderId, studentId, merchantId, totalAmount, 'delivered', `${date} 12:00:00`]
          );

          // Insert order item
          const subtotal = quantity * unitPrice;
          await db.query(
            `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT DO NOTHING`,
            [orderId, productId, quantity, unitPrice, subtotal]
          );

          insertedOrders++;
          insertedItems++;
          orderId++;
        } catch (err) {
          console.error(`[ERROR] Failed to insert order ${orderId}: ${err.message}`);
        }
      }
    }

    console.log();
    console.log('====================================================================');
    console.log('LOAD COMPLETE');
    console.log('====================================================================\n');

    console.log(`[OK] Inserted ${insertedOrders} orders with ${insertedItems} order items`);
    if (skippedProducts > 0) {
      console.log(`[WARN] Skipped ${skippedProducts} products (not found in database)`);
    }

    // Step 4: Verify data
    console.log('\n[Verification] Checking sales data distribution...\n');

    const verification = await db.query(`
      SELECT
        COUNT(DISTINCT DATE(o.created_at)) as days_with_sales,
        SUM(oi.quantity) as total_quantity,
        ROUND(AVG(oi.quantity)::numeric, 1) as avg_quantity,
        MIN(o.created_at) as first_sale,
        MAX(o.created_at) as last_sale
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.merchant_id = $1 AND o.order_status = 'delivered'
    `, [merchantId]);

    if (verification.rows.length > 0) {
      const stats = verification.rows[0];
      console.log(`[OK] Days with sales: ${stats.days_with_sales}`);
      console.log(`[OK] Total quantity: ${stats.total_quantity} units`);
      console.log(`[OK] Avg daily quantity: ${stats.avg_quantity} units`);
      console.log(`[OK] Date range: ${stats.first_sale.toISOString().split('T')[0]} to ${stats.last_sale.toISOString().split('T')[0]}`);
    }

    console.log('\n====================================================================');
    console.log('[SUCCESS] Synthetic data loaded successfully!');
    console.log('====================================================================\n');

    console.log('Next steps:');
    console.log('  1. Run forecast refresh: POST /api/v1/merchant/predictions/refresh');
    console.log('  2. Check weekly forecast: GET /api/v1/merchant/predictions/weekly');
    console.log('  3. View dashboard: Merchant → Dashboard → Sales Forecast\n');

  } catch (error) {
    console.error('[FATAL ERROR]', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the loader
loadSyntheticData().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
