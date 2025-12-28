#!/usr/bin/env node
/**
 * Generate realistic sales transaction data for all merchants
 * Creates 180 days of individual sales records for testing ensemble forecasting
 * Uses merchant_sales table with correct schema
 */

const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'wego_dev'
});

// Configuration
const HISTORICAL_DAYS = 180;
const BATCH_SIZE = 100;

/**
 * Helper functions for date manipulation
 */
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

/**
 * Merchant patterns with realistic sales characteristics
 */
function generateMerchantPattern(merchantId) {
  const patterns = {
    3: { base: 15, trend: 0.05, variance: 0.2, name: "Campus Merchant", avgOrderValue: 80, productsAvailable: [1, 2, 3, 4, 5] },
    11: { base: 20, trend: 0.02, variance: 0.15, name: "Fatmata Jalloh", avgOrderValue: 120, productsAvailable: [1, 2, 3, 6, 7] },
    12: { base: 12, trend: 0.08, variance: 0.25, name: "Long Man", avgOrderValue: 60, productsAvailable: [2, 3, 4, 5] },
    14: { base: 18, trend: 0.03, variance: 0.18, name: "Merchant Position 1", avgOrderValue: 100, productsAvailable: [1, 2, 3, 4] },
    15: { base: 16, trend: 0.04, variance: 0.22, name: "Merchant Position 2", avgOrderValue: 90, productsAvailable: [1, 3, 5, 6] },
    16: { base: 22, trend: 0.01, variance: 0.20, name: "Merchant Position 3", avgOrderValue: 110, productsAvailable: [2, 3, 4, 5, 6] },
    17: { base: 14, trend: 0.06, variance: 0.24, name: "Merchant Position 4", avgOrderValue: 70, productsAvailable: [1, 2, 4] },
    18: { base: 19, trend: 0.03, variance: 0.19, name: "Merchant Position 5", avgOrderValue: 95, productsAvailable: [1, 3, 5, 6, 7] },
    19: { base: 17, trend: 0.04, variance: 0.21, name: "Merchant Position 6", avgOrderValue: 85, productsAvailable: [2, 4, 5, 6] }
  };

  return patterns[merchantId] || {
    base: 15, trend: 0.04, variance: 0.20, name: `Merchant ${merchantId}`,
    avgOrderValue: 85, productsAvailable: [1, 2, 3, 4, 5]
  };
}

/**
 * Calculate daily sales count with realistic patterns
 */
function calculateDailySalesCount(merchantId, date, baseCount, trend, variance) {
  const dayOfWeek = new Date(date).getDay();
  const dayOfMonth = new Date(date).getDate();
  const dayOfYear = Math.floor((new Date(date) - new Date(new Date(date).getFullYear(), 0, 0)) / 86400000);

  // Day of week pattern (weekends slightly lower - students busy)
  const dayOfWeekFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.85 : 1.1;

  // Monthly pattern (mid-month lower due to student budget)
  const monthlyFactor = dayOfMonth <= 7 ? 1.15 : (dayOfMonth >= 20 ? 1.05 : 0.90);

  // Seasonal trend (gradual increase)
  const trendFactor = 1 + (trend * (dayOfYear / 365));

  // Random variation
  const randomFactor = 1 + (Math.random() - 0.5) * variance;

  // Calculate final count
  const count = Math.round(baseCount * dayOfWeekFactor * monthlyFactor * trendFactor * randomFactor);
  return Math.max(1, count); // At least 1 order per day
}

/**
 * Generate sales data for a single merchant
 */
async function generateMerchantData(merchantId) {
  try {
    const pattern = generateMerchantPattern(merchantId);
    const data = [];
    const startDate = subtractDays(new Date(), HISTORICAL_DAYS);
    let orderId = Math.floor(Math.random() * 100000) + 1000;

    console.log(`\n📊 Generating data for Merchant ${merchantId} (${pattern.name})`);
    console.log(`   Avg orders/day: ${pattern.base}`);
    console.log(`   Growth trend: ${(pattern.trend * 100).toFixed(1)}%`);
    console.log(`   Available products: ${pattern.productsAvailable.join(', ')}`);

    // Generate daily sales for 180 days
    for (let dayIndex = 0; dayIndex < HISTORICAL_DAYS; dayIndex++) {
      const currentDate = addDays(startDate, dayIndex);
      const dateStr = formatDateTime(currentDate);

      // Calculate how many orders for this day
      const ordersCount = calculateDailySalesCount(
        merchantId,
        currentDate,
        pattern.base,
        pattern.trend,
        pattern.variance
      );

      // Generate individual orders
      for (let orderIdx = 0; orderIdx < ordersCount; orderIdx++) {
        // Random product from available products
        const productId = pattern.productsAvailable[
          Math.floor(Math.random() * pattern.productsAvailable.length)
        ];

        // Random quantity (1-5 units)
        const quantity = Math.floor(Math.random() * 5) + 1;

        // Price varies by product
        const unitPrice = 50 + (productId * 10) + (Math.random() * 20);
        const totalAmount = quantity * unitPrice;
        const commissionRate = 0.05; // 5% commission
        const commissionAmount = totalAmount * commissionRate;
        const netAmount = totalAmount - commissionAmount;

        data.push({
          merchant_id: merchantId,
          order_id: orderId++,
          product_id: productId,
          quantity,
          unit_price: unitPrice,
          total_amount: totalAmount,
          commission_rate: commissionRate,
          commission_amount: commissionAmount,
          net_amount: netAmount,
          sale_date: dateStr,
          status: 'confirmed'
        });
      }
    }

    // Insert in batches
    let inserted = 0;
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);

      const values = batch
        .map((d, idx) => `($${idx * 11 + 1}, $${idx * 11 + 2}, $${idx * 11 + 3}, $${idx * 11 + 4}, $${idx * 11 + 5}, $${idx * 11 + 6}, $${idx * 11 + 7}, $${idx * 11 + 8}, $${idx * 11 + 9}, $${idx * 11 + 10}, $${idx * 11 + 11})`)
        .join(',');

      const params = batch.flatMap(d => [
        d.merchant_id,
        d.order_id,
        d.product_id,
        d.quantity,
        d.unit_price,
        d.total_amount,
        d.commission_rate,
        d.commission_amount,
        d.net_amount,
        d.sale_date,
        d.status
      ]);

      const query = `
        INSERT INTO merchant_sales
        (merchant_id, order_id, product_id, quantity, unit_price, total_amount,
         commission_rate, commission_amount, net_amount, sale_date, status)
        VALUES ${values}
      `;

      try {
        await pool.query(query, params);
        inserted += batch.length;
        process.stdout.write(`\r   Inserted: ${inserted}/${data.length} records`);
      } catch (err) {
        console.error(`\n   Error inserting batch: ${err.message}`);
        throw err;
      }
    }

    console.log(`\n   ✓ Generated ${data.length} sales records (${Math.round(data.length / HISTORICAL_DAYS)}/day average)`);
    return data.length;

  } catch (error) {
    console.error(`✗ Error generating data for merchant ${merchantId}:`, error.message);
    throw error;
  }
}

/**
 * Get data statistics for a merchant
 */
async function getMerchantStats(merchantId) {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_orders,
        COUNT(DISTINCT DATE(sale_date)) as days_with_sales,
        ROUND(AVG(quantity)::numeric, 2) as avg_quantity,
        ROUND(AVG(total_amount)::numeric, 2) as avg_order_value,
        ROUND(SUM(total_amount)::numeric, 2) as total_revenue,
        ROUND(SUM(net_amount)::numeric, 2) as net_revenue,
        MIN(sale_date) as first_sale,
        MAX(sale_date) as last_sale
      FROM merchant_sales
      WHERE merchant_id = $1
    `, [merchantId]);

    return result.rows[0];
  } catch (error) {
    console.error(`Error getting stats for merchant ${merchantId}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('MULTI-MERCHANT SALES DATA GENERATION');
  console.log('='.repeat(80));
  console.log(`\nGenerating ${HISTORICAL_DAYS} days of individual sales transactions`);
  console.log(`for all merchants in the system...\n`);

  let totalRecords = 0;
  const stats = {};

  try {
    // Get all merchants
    const merchantsResult = await pool.query(
      'SELECT id, name FROM users WHERE role = \'merchant\' ORDER BY id'
    );
    const merchants = merchantsResult.rows;

    if (merchants.length === 0) {
      console.error('No merchants found in database!');
      process.exit(1);
    }

    console.log(`Found ${merchants.length} merchants to process:\n`);
    merchants.forEach((m, idx) => {
      const pattern = generateMerchantPattern(m.id);
      console.log(`  ${idx + 1}. Merchant ${m.id}: ${m.name}`);
    });

    // Generate data for each merchant
    for (const merchant of merchants) {
      try {
        const recordsGenerated = await generateMerchantData(merchant.id);
        totalRecords += recordsGenerated;

        // Get statistics
        const merchantStats = await getMerchantStats(merchant.id);
        if (merchantStats) {
          stats[merchant.id] = {
            name: merchant.name,
            ...merchantStats
          };
        }
      } catch (error) {
        console.error(`\n✗ Failed to generate data for merchant ${merchant.id}`);
        throw error;
      }
    }

    // Display summary
    console.log('\n' + '='.repeat(80));
    console.log('GENERATION COMPLETE - SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n✓ Total transactions generated: ${totalRecords}\n`);

    console.log('Merchant Sales Statistics:');
    console.log('-'.repeat(100));
    console.log(
      'ID  | Name                  | Orders | Days | Avg Order | Total Revenue | Net Revenue   | Avg Qty'.padEnd(100)
    );
    console.log('-'.repeat(100));

    Object.entries(stats).forEach(([merchantId, stat]) => {
      const line = [
        String(merchantId).padEnd(3),
        '| ',
        stat.name.slice(0, 20).padEnd(22),
        '| ',
        String(stat.total_orders).padEnd(6),
        '| ',
        String(stat.days_with_sales).padEnd(4),
        '| ',
        `$${Number(stat.avg_order_value).toFixed(2)}`.padEnd(9),
        '| ',
        `$${Number(stat.total_revenue).toFixed(2)}`.padEnd(13),
        '| ',
        `$${Number(stat.net_revenue).toFixed(2)}`.padEnd(13),
        '| ',
        Number(stat.avg_quantity).toFixed(2)
      ].join('');
      console.log(line);
    });

    console.log('-'.repeat(100));

    // Verify data integrity
    console.log('\nData Integrity Checks:');
    const totalCheck = await pool.query('SELECT COUNT(*) as count FROM merchant_sales');
    console.log(`✓ Total merchant_sales records: ${totalCheck.rows[0].count.toLocaleString()}`);

    const merchantCheck = await pool.query(
      'SELECT COUNT(DISTINCT merchant_id) as count FROM merchant_sales'
    );
    console.log(`✓ Merchants with data: ${merchantCheck.rows[0].count}`);

    const dateRangeCheck = await pool.query(`
      SELECT
        MIN(DATE(sale_date)) as earliest,
        MAX(DATE(sale_date)) as latest,
        COUNT(DISTINCT DATE(sale_date)) as unique_days
      FROM merchant_sales
    `);
    console.log(`✓ Date range: ${dateRangeCheck.rows[0].earliest} to ${dateRangeCheck.rows[0].latest}`);
    console.log(`✓ Days with data: ${dateRangeCheck.rows[0].unique_days}`);

    // Product distribution
    const productCheck = await pool.query(`
      SELECT COUNT(DISTINCT product_id) as unique_products FROM merchant_sales
    `);
    console.log(`✓ Unique products sold: ${productCheck.rows[0].unique_products}`);

    // Revenue statistics
    const revenueCheck = await pool.query(`
      SELECT
        ROUND(SUM(total_amount)::numeric, 2) as total,
        ROUND(SUM(net_amount)::numeric, 2) as net_after_commission,
        ROUND(SUM(commission_amount)::numeric, 2) as total_commission,
        ROUND(AVG(total_amount)::numeric, 2) as avg_order
      FROM merchant_sales
    `);
    console.log(`\nRevenue Summary:`);
    console.log(`  ├─ Total Revenue: $${revenueCheck.rows[0].total.toLocaleString()}`);
    console.log(`  ├─ Net Revenue (after commission): $${revenueCheck.rows[0].net_after_commission.toLocaleString()}`);
    console.log(`  ├─ Total Commission: $${revenueCheck.rows[0].total_commission.toLocaleString()}`);
    console.log(`  └─ Average Order Value: $${revenueCheck.rows[0].avg_order}`);

    console.log('\n' + '='.repeat(80));
    console.log('✓ Data generation successful!');
    console.log('Ready for ensemble forecasting tests across all merchants');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n✗ Data generation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
