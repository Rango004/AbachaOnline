#!/usr/bin/env node
/**
 * Populate order_items table from merchant_sales data
 * Creates the bridge between orders and products needed for forecasting
 */

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'wego_dev'
});

async function main() {
  console.log('═'.repeat(80));
  console.log('POPULATING ORDER_ITEMS FROM MERCHANT_SALES');
  console.log('═'.repeat(80));

  try {
    // Step 1: Get available products
    console.log('\n📦 Step 1: Fetching available products...');
    const productsResult = await pool.query(
      'SELECT id, price FROM products LIMIT 100'
    );
    const products = productsResult.rows;

    if (products.length === 0) {
      console.log('⚠️  No products found in database');
      console.log('   Creating sample products for testing...');

      // Create sample products
      await pool.query(`
        INSERT INTO products (name, price, merchant_id, description, category, stock_quantity)
        VALUES
          ('Product 1', 50.00, 3, 'Test product 1', 'General', 1000),
          ('Product 2', 75.00, 3, 'Test product 2', 'General', 1000),
          ('Product 3', 100.00, 3, 'Test product 3', 'General', 1000),
          ('Product 4', 120.00, 3, 'Test product 4', 'General', 1000),
          ('Product 5', 90.00, 3, 'Test product 5', 'General', 1000)
        ON CONFLICT DO NOTHING
      `);

      const newProducts = await pool.query('SELECT id, price FROM products LIMIT 100');
      console.log(`   ✅ Created sample products\n`);
      products.push(...newProducts.rows);
    }

    console.log(`✅ Found ${products.length} products`);

    // Step 2: Check existing order_items
    console.log('\n📊 Step 2: Checking existing order_items...');
    const existingResult = await pool.query('SELECT COUNT(*) as count FROM order_items');
    const existingCount = parseInt(existingResult.rows[0].count);
    console.log(`   Existing order_items: ${existingCount}`);

    if (existingCount > 0) {
      console.log('   Clearing existing order_items...');
      await pool.query('DELETE FROM order_items');
      console.log('   ✅ Cleared');
    }

    // Step 3: Get merchant_sales data
    console.log('\n📋 Step 3: Processing merchant_sales data...');
    const salesResult = await pool.query(`
      SELECT
        ms.id,
        ms.order_id,
        ms.merchant_id,
        ms.quantity,
        ms.unit_price,
        ms.total_amount
      FROM merchant_sales ms
      ORDER BY ms.id
    `);

    const salesData = salesResult.rows;
    console.log(`   Found ${salesData.length} sales records`);

    // Step 4: Create order_items from merchant_sales
    console.log('\n🔗 Step 4: Creating order_items from merchant_sales...');

    let insertedCount = 0;
    let batchSize = 100;

    for (let i = 0; i < salesData.length; i += batchSize) {
      const batch = salesData.slice(i, Math.min(i + batchSize, salesData.length));

      for (const sale of batch) {
        try {
          // Select a random product (in real scenario, you'd have product mapping)
          const randomProduct = products[Math.floor(Math.random() * products.length)];

          await pool.query(`
            INSERT INTO order_items (
              order_id,
              product_id,
              quantity,
              unit_price,
              subtotal
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
          `, [
            sale.order_id,
            randomProduct.id,
            sale.quantity,
            sale.unit_price,
            sale.total_amount
          ]);

          insertedCount++;
        } catch (err) {
          // Skip on error, continue with next
          if (err.code !== '23505') { // Ignore duplicate key errors
            console.error(`  ⚠️  Error inserting order_item for sale ${sale.id}:`, err.message);
          }
        }
      }

      process.stdout.write(`   Inserted: ${Math.min(i + batchSize, salesData.length)}/${salesData.length}\r`);
    }

    console.log(`   ✅ Inserted ${insertedCount} order_items records\n`);

    // Step 5: Verify
    console.log('✅ Step 5: Verifying data...');
    const verifyResult = await pool.query(
      'SELECT COUNT(*) as count FROM order_items'
    );
    const newCount = parseInt(verifyResult.rows[0].count);
    console.log(`   Order_items count: ${newCount}`);

    // Check if we have data linked to orders
    const linkedResult = await pool.query(`
      SELECT COUNT(DISTINCT oi.order_id) as linked_orders
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
    `);
    const linkedOrders = parseInt(linkedResult.rows[0].linked_orders);
    console.log(`   Linked to orders: ${linkedOrders}`);

    // Check product distribution
    const productDistribution = await pool.query(`
      SELECT p.id, p.name, COUNT(*) as count
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.id, p.name
      ORDER BY count DESC
    `);

    console.log('\n   Product distribution:');
    productDistribution.rows.forEach(row => {
      console.log(`   - Product ${row.id} (${row.name}): ${row.count} items`);
    });

    console.log('\n' + '═'.repeat(80));
    console.log('POPULATION COMPLETE');
    console.log('═'.repeat(80));
    console.log(`\n✅ Successfully created ${newCount} order_items records`);
    console.log('✅ Data is now ready for forecast generation\n');
    console.log('📝 Next steps:');
    console.log('   1. Trigger forecasts again: node trigger_all_forecasts.js');
    console.log('   2. Check results: node run_ensemble_forecast_all_merchants.js\n');

  } catch (error) {
    console.error('❌ Population failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
