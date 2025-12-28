const db = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function reloadData() {
  try {
    console.log('====================================================================');
    console.log('Reloading Synthetic Data');
    console.log('====================================================================\n');

    // Step 1: Delete old data
    console.log('[1/3] Deleting old synthetic orders...');
    const deleteResult = await db.query(
      `DELETE FROM order_items WHERE order_id IN
       (SELECT id FROM orders WHERE merchant_id = 3 AND id >= 10000)`,
      []
    );
    console.log(`[OK] Deleted ${deleteResult.rowCount} order items`);

    const deleteOrders = await db.query(
      `DELETE FROM orders WHERE merchant_id = 3 AND id >= 10000`,
      []
    );
    console.log(`[OK] Deleted ${deleteOrders.rowCount} orders\n`);

    // Step 2: Read and load new data
    console.log('[2/3] Loading new synthetic data...');
    const jsonFile = path.join(__dirname, 'synthetic_sales_data.json');
    const syntheticData = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));

    // Map product names to IDs
    const productMap = {};
    for (const [productName, data] of Object.entries(syntheticData)) {
      const result = await db.query(
        `SELECT id FROM products WHERE name = $1 AND merchant_id = 3`,
        [productName]
      );
      if (result.rows.length > 0) {
        productMap[productName] = result.rows[0].id;
        console.log(`  ✓ ${productName} -> ID ${result.rows[0].id}`);
      }
    }
    console.log();

    // Step 3: Insert new orders
    console.log('[3/3] Inserting new orders...');
    const unitPrice = 50;
    let orderId = 10000;
    let insertedOrders = 0;

    for (const [productName, salesData] of Object.entries(syntheticData)) {
      const productId = productMap[productName];
      if (!productId) continue;

      for (const dayData of salesData) {
        const date = dayData.date;
        const quantity = dayData.quantity;
        const totalAmount = quantity * unitPrice;

        // Insert order with tracking number
        const trackingNumber = `SYNTH-${orderId}`;
        await db.query(
          `INSERT INTO orders (id, student_id, merchant_id, total_amount, order_status, tracking_number, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
           ON CONFLICT (id) DO NOTHING`,
          [orderId, 2, 3, totalAmount, 'delivered', trackingNumber, `${date} 12:00:00`]
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
        orderId++;
      }
    }

    console.log(`[OK] Inserted ${insertedOrders} orders\n`);

    // Verify
    console.log('====================================================================');
    console.log('Verification');
    console.log('====================================================================\n');

    const verification = await db.query(`
      SELECT
        COUNT(DISTINCT DATE(o.created_at)) as days_with_sales,
        SUM(oi.quantity) as total_quantity,
        MIN(o.created_at) as first_sale,
        MAX(o.created_at) as last_sale
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.merchant_id = 3 AND o.order_status = 'delivered'
    `, []);

    if (verification.rows.length > 0) {
      const stats = verification.rows[0];
      console.log(`[OK] Days with sales: ${stats.days_with_sales}`);
      console.log(`[OK] Total quantity: ${stats.total_quantity} units`);
      console.log(`[OK] Date range: ${stats.first_sale.toISOString().split('T')[0]} to ${stats.last_sale.toISOString().split('T')[0]}`);
    }

    console.log('\n[SUCCESS] Data reload complete!\n');

  } catch (error) {
    console.error('[ERROR]', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

reloadData().then(() => process.exit(0));
