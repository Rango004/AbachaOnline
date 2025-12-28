#!/usr/bin/env node
/**
 * Generate realistic orders and sales data for all merchants
 * Creates 180 days of individual orders and merchant_sales transactions
 */

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'wego_dev'
});

const HISTORICAL_DAYS = 180;
const BATCH_SIZE = 50;

function subtractDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const second = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function generateMerchantPattern(merchantId) {
  const patterns = {
    3: { base: 15, trend: 0.05, variance: 0.2, name: "Campus Merchant" },
    11: { base: 20, trend: 0.02, variance: 0.15, name: "Fatmata Jalloh" },
    12: { base: 12, trend: 0.08, variance: 0.25, name: "Long Man" },
    14: { base: 18, trend: 0.03, variance: 0.18, name: "Merchant Position 1" },
    15: { base: 16, trend: 0.04, variance: 0.22, name: "Merchant Position 2" },
    16: { base: 22, trend: 0.01, variance: 0.20, name: "Merchant Position 3" },
    17: { base: 14, trend: 0.06, variance: 0.24, name: "Merchant Position 4" },
    18: { base: 19, trend: 0.03, variance: 0.19, name: "Merchant Position 5" },
    19: { base: 17, trend: 0.04, variance: 0.21, name: "Merchant Position 6" }
  };
  return patterns[merchantId] || { base: 15, trend: 0.04, variance: 0.20, name: `Merchant ${merchantId}` };
}

function calculateDailySalesCount(merchantId, date, baseCount, trend, variance) {
  const dayOfWeek = new Date(date).getDay();
  const dayOfMonth = new Date(date).getDate();
  const dayOfYear = Math.floor((new Date(date) - new Date(new Date(date).getFullYear(), 0, 0)) / 86400000);

  const dayOfWeekFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.85 : 1.1;
  const monthlyFactor = dayOfMonth <= 7 ? 1.15 : (dayOfMonth >= 20 ? 1.05 : 0.90);
  const trendFactor = 1 + (trend * (dayOfYear / 365));
  const randomFactor = 1 + (Math.random() - 0.5) * variance;

  const count = Math.round(baseCount * dayOfWeekFactor * monthlyFactor * trendFactor * randomFactor);
  return Math.max(1, count);
}

let globalOrderIdCounter = null;

async function initializeOrderIdCounter() {
  if (globalOrderIdCounter !== null) return; // Already initialized
  try {
    const result = await pool.query('SELECT MAX(id) as max_id FROM orders');
    const maxId = result.rows[0]?.max_id || 0;
    globalOrderIdCounter = Math.max(1000000, maxId + 1000); // Start after existing IDs
    console.log(`   Starting order IDs from: ${globalOrderIdCounter}`);
  } catch (err) {
    globalOrderIdCounter = 1000000; // Fallback if query fails
  }
}

async function generateMerchantData(merchantId) {
  try {
    const pattern = generateMerchantPattern(merchantId);
    const orders = [];
    const sales = [];
    const startDate = subtractDays(new Date(), HISTORICAL_DAYS);
    // Use global counter to ensure uniqueness across all merchants
    let orderId = globalOrderIdCounter;
    let orderIdCounter = 0;

    console.log(`\n📊 Generating data for Merchant ${merchantId} (${pattern.name})`);
    console.log(`   Avg orders/day: ${pattern.base}`);

    // Delete existing data for this merchant to avoid conflicts
    console.log(`   Cleaning up existing data...`);
    try {
      await pool.query(`DELETE FROM merchant_sales WHERE merchant_id = $1`, [merchantId]);
      await pool.query(`DELETE FROM orders WHERE merchant_id = $1`, [merchantId]);
    } catch (err) {
      console.log(`   Note: Cleanup incomplete - ${err.message.substring(0, 50)}`);
    }

    // Generate orders and sales for 180 days
    for (let dayIndex = 0; dayIndex < HISTORICAL_DAYS; dayIndex++) {
      const currentDate = addDays(startDate, dayIndex);
      const dateStr = formatDateTime(currentDate);

      const ordersCount = calculateDailySalesCount(merchantId, currentDate, pattern.base, pattern.trend, pattern.variance);

      for (let orderIdx = 0; orderIdx < ordersCount; orderIdx++) {
        const currentOrderId = orderId + (orderIdCounter++);
        const productId = Math.floor(Math.random() * 5) + 1;
        const quantity = Math.floor(Math.random() * 5) + 1;
        const unitPrice = 50 + (productId * 10) + (Math.random() * 20);
        const totalAmount = quantity * unitPrice;
        // Generate unique tracking number: M{merchantId}-{timestamp}-{counter}
        const trackingNumber = `M${merchantId}-${Date.now()}-${orderIdCounter}`;

        // Order record
        orders.push({
          id: currentOrderId,
          merchant_id: merchantId,
          student_id: null, // Not linking to specific students for test data
          total_amount: totalAmount,
          order_status: 'delivered',
          tracking_number: trackingNumber,
          created_at: dateStr
        });

        // Sales record
        sales.push({
          merchant_id: merchantId,
          order_id: currentOrderId,
          product_id: productId,
          quantity,
          unit_price: unitPrice,
          total_amount: totalAmount,
          commission_rate: 0.05,
          commission_amount: totalAmount * 0.05,
          net_amount: totalAmount * 0.95,
          sale_date: dateStr,
          status: 'confirmed'
        });
      }
    }

    // Insert orders in batches
    console.log(`   Inserting ${orders.length} orders...`);
    let inserted = 0;
    for (let i = 0; i < orders.length; i += BATCH_SIZE) {
      const batch = orders.slice(i, i + BATCH_SIZE);

      const values = batch
        .map((o, idx) => `($${idx * 7 + 1}, $${idx * 7 + 2}, $${idx * 7 + 3}, $${idx * 7 + 4}, $${idx * 7 + 5}, $${idx * 7 + 6}, $${idx * 7 + 7})`)
        .join(',');

      const params = batch.flatMap(o => [o.id, o.merchant_id, o.student_id, o.total_amount, o.order_status, o.tracking_number, o.created_at]);

      const query = `INSERT INTO orders (id, merchant_id, student_id, total_amount, order_status, tracking_number, created_at) VALUES ${values}`;

      try {
        await pool.query(query, params);
        inserted += batch.length;
        process.stdout.write(`\r   Orders inserted: ${inserted}/${orders.length}`);
      } catch (err) {
        console.error(`\n   Error inserting orders batch: ${err.message}`);
        throw err;
      }
    }

    // Insert sales in batches
    console.log(`\n   Inserting ${sales.length} sales records...`);
    inserted = 0;
    for (let i = 0; i < sales.length; i += BATCH_SIZE) {
      const batch = sales.slice(i, i + BATCH_SIZE);

      const values = batch
        .map((s, idx) => `($${idx * 11 + 1}, $${idx * 11 + 2}, $${idx * 11 + 3}, $${idx * 11 + 4}, $${idx * 11 + 5}, $${idx * 11 + 6}, $${idx * 11 + 7}, $${idx * 11 + 8}, $${idx * 11 + 9}, $${idx * 11 + 10}, $${idx * 11 + 11})`)
        .join(',');

      const params = batch.flatMap(s => [
        s.merchant_id, s.order_id, s.product_id, s.quantity, s.unit_price, s.total_amount,
        s.commission_rate, s.commission_amount, s.net_amount, s.sale_date, s.status
      ]);

      const query = `INSERT INTO merchant_sales (merchant_id, order_id, product_id, quantity, unit_price, total_amount, commission_rate, commission_amount, net_amount, sale_date, status) VALUES ${values}`;

      try {
        await pool.query(query, params);
        inserted += batch.length;
        process.stdout.write(`\r   Sales inserted: ${inserted}/${sales.length}`);
      } catch (err) {
        if (!err.message.includes('duplicate key')) throw err;
      }
    }

    console.log(`\n   ✓ Generated ${orders.length} orders and ${sales.length} sales records`);
    // Update global counter for next merchant
    globalOrderIdCounter += orders.length + 1000; // Add buffer for safety
    return { orders: orders.length, sales: sales.length };

  } catch (error) {
    console.error(`✗ Error generating data for merchant ${merchantId}:`, error.message);
    throw error;
  }
}

async function getMerchantStats(merchantId) {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(*) as total_sales,
        COUNT(DISTINCT DATE(ms.sale_date)) as days_with_sales,
        ROUND(AVG(ms.total_amount)::numeric, 2) as avg_order_value,
        ROUND(SUM(ms.total_amount)::numeric, 2) as total_revenue,
        ROUND(SUM(ms.net_amount)::numeric, 2) as net_revenue,
        MIN(ms.sale_date) as first_sale,
        MAX(ms.sale_date) as last_sale
      FROM merchant_sales ms
      JOIN orders o ON ms.order_id = o.id
      WHERE ms.merchant_id = $1
    `, [merchantId]);

    return result.rows[0];
  } catch (error) {
    console.error(`Error getting stats for merchant ${merchantId}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('MULTI-MERCHANT ORDERS & SALES DATA GENERATION');
  console.log('='.repeat(80));
  console.log(`\nGenerating ${HISTORICAL_DAYS} days of orders and sales transactions...\n`);

  let totalStats = { orders: 0, sales: 0 };
  const stats = {};

  try {
    // Initialize the global order ID counter
    await initializeOrderIdCounter();

    const merchantsResult = await pool.query('SELECT id, name FROM users WHERE role = \'merchant\' ORDER BY id');
    const merchants = merchantsResult.rows;

    if (merchants.length === 0) {
      console.error('No merchants found!');
      process.exit(1);
    }

    console.log(`Found ${merchants.length} merchants:\n`);
    merchants.forEach((m, idx) => console.log(`  ${idx + 1}. Merchant ${m.id}: ${m.name}`));

    // Generate data for each merchant
    for (const merchant of merchants) {
      try {
        const counts = await generateMerchantData(merchant.id);
        totalStats.orders += counts.orders;
        totalStats.sales += counts.sales;

        const merchantStats = await getMerchantStats(merchant.id);
        if (merchantStats) {
          stats[merchant.id] = { name: merchant.name, ...merchantStats };
        }
      } catch (error) {
        console.error(`\n✗ Failed for merchant ${merchant.id}`);
        throw error;
      }
    }

    // Display summary
    console.log('\n' + '='.repeat(100));
    console.log('GENERATION COMPLETE - MERCHANT SALES SUMMARY');
    console.log('='.repeat(100));
    console.log(`\n✓ Total orders created: ${totalStats.orders.toLocaleString()}`);
    console.log(`✓ Total sales records: ${totalStats.sales.toLocaleString()}\n`);

    console.log('Merchant Statistics:');
    console.log('-'.repeat(100));
    console.log('ID  | Name                  | Orders | Sales | Days | Avg Order | Total Revenue | Net Revenue   | Period');
    console.log('-'.repeat(100));

    Object.entries(stats).forEach(([merchantId, stat]) => {
      const line = [
        String(merchantId).padEnd(3),
        '| ',
        (stat.name || '').slice(0, 20).padEnd(22),
        '| ',
        String(stat.total_orders).padEnd(6),
        '| ',
        String(stat.total_sales).padEnd(5),
        '| ',
        String(stat.days_with_sales).padEnd(4),
        '| ',
        `$${Number(stat.avg_order_value).toFixed(2)}`.padEnd(9),
        '| ',
        `$${Number(stat.total_revenue).toFixed(2)}`.padEnd(13),
        '| ',
        `$${Number(stat.net_revenue).toFixed(2)}`.padEnd(13),
        '| ',
        `${stat.first_sale ? stat.first_sale.substring(0, 10) : 'N/A'} to ${stat.last_sale ? stat.last_sale.substring(0, 10) : 'N/A'}`
      ].join('');
      console.log(line);
    });

    console.log('-'.repeat(100));

    // Verification
    console.log('\nData Integrity Checks:');
    const totalOrders = await pool.query('SELECT COUNT(*) as count FROM orders');
    console.log(`✓ Total orders in system: ${totalOrders.rows[0].count.toLocaleString()}`);

    const totalSales = await pool.query('SELECT COUNT(*) as count FROM merchant_sales');
    console.log(`✓ Total merchant_sales records: ${totalSales.rows[0].count.toLocaleString()}`);

    const revenue = await pool.query('SELECT ROUND(SUM(total_amount)::numeric, 2) as total FROM merchant_sales');
    console.log(`✓ Total system revenue: $${revenue.rows[0].total?.toLocaleString() || 0}`);

    console.log('\n' + '='.repeat(100));
    console.log('✓ Data generation successful! Ready for ensemble forecasting tests.');
    console.log('='.repeat(100) + '\n');

  } catch (error) {
    console.error('\n✗ Data generation failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
