#!/usr/bin/env node
/**
 * Generate comprehensive sales data for all merchants
 * Creates 180 days of historical sales data with realistic patterns
 * for testing ensemble forecasting across different merchants
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
const HISTORICAL_DAYS = 180;  // 6 months of historical data
const BATCH_SIZE = 100;       // Insert in batches for performance

/**
 * Generate realistic sales patterns for a merchant
 */
function generateMerchantPattern(merchantId) {
  // Different base patterns for different merchants
  const patterns = {
    3: { base: 80, trend: 0.05, variance: 0.2, name: "Nuru's Supplies" },
    4: { base: 120, trend: 0.02, variance: 0.15, name: "Campus Food Hub" },
    5: { base: 60, trend: 0.08, variance: 0.25, name: "Hostel Store" },
    6: { base: 100, trend: 0.03, variance: 0.18, name: "Quick Shop" },
    7: { base: 90, trend: 0.04, variance: 0.22, name: "Daily Essentials" },
    8: { base: 110, trend: 0.01, variance: 0.20, name: "Campus Mart" },
    9: { base: 70, trend: 0.06, variance: 0.24, name: "Snack Central" },
    10: { base: 95, trend: 0.03, variance: 0.19, name: "General Store" }
  };

  return patterns[merchantId] || { base: 85, trend: 0.04, variance: 0.20, name: `Merchant ${merchantId}` };
}

/**
 * Calculate daily sales with seasonal and day-of-week patterns
 */
function calculateDailySales(merchantId, date, baseQuantity, trend, variance) {
  const dayOfWeek = new Date(date).getDay();
  const dayOfMonth = new Date(date).getDate();
  const dayOfYear = Math.floor((new Date(date) - new Date(new Date(date).getFullYear(), 0, 0)) / 86400000);

  // Day of week pattern (weekends slightly higher)
  const dayOfWeekFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.15 : 1.0;

  // Monthly pattern (mid-month lower due to student budget)
  const monthlyFactor = dayOfMonth <= 7 ? 1.1 : (dayOfMonth >= 20 ? 1.05 : 0.95);

  // Seasonal trend (gradual increase)
  const trendFactor = 1 + (trend * (dayOfYear / 365));

  // Random variation
  const randomFactor = 1 + (Math.random() - 0.5) * variance;

  // Calculate final quantity
  const quantity = Math.round(
    baseQuantity * dayOfWeekFactor * monthlyFactor * trendFactor * randomFactor
  );

  return Math.max(10, quantity); // Minimum 10 units
}

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

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate sales data for a single merchant
 */
async function generateMerchantData(merchantId) {
  try {
    const pattern = generateMerchantPattern(merchantId);
    const data = [];
    const startDate = subtractDays(new Date(), HISTORICAL_DAYS);

    console.log(`\n📊 Generating data for Merchant ${merchantId} (${pattern.name})`);
    console.log(`   Base quantity: ${pattern.base} units/day`);
    console.log(`   Trend: ${(pattern.trend * 100).toFixed(1)}% growth`);
    console.log(`   Variance: ${(pattern.variance * 100).toFixed(0)}%`);

    // Generate daily sales for 180 days
    for (let i = 0; i < HISTORICAL_DAYS; i++) {
      const currentDate = addDays(startDate, i);
      const dateStr = formatDate(currentDate);

      // Get all products for this merchant (using product_id 1-10 as sample)
      // In real system, would query actual products
      const productsPerMerchant = 5; // Each merchant sells 5 products

      for (let productId = 1; productId <= productsPerMerchant; productId++) {
        const quantity = calculateDailySales(
          merchantId,
          dateStr,
          pattern.base / productsPerMerchant,
          pattern.trend,
          pattern.variance
        );

        const revenue = quantity * (50 + productId * 10); // Different price per product

        data.push({
          merchant_id: merchantId,
          product_id: productId,
          date: dateStr,
          quantity,
          revenue
        });
      }
    }

    // Insert in batches
    let inserted = 0;
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);

      const values = batch
        .map((d, idx) => `($${idx * 5 + 1}, $${idx * 5 + 2}, $${idx * 5 + 3}, $${idx * 5 + 4}, $${idx * 5 + 5})`)
        .join(',');

      const params = batch.flatMap(d => [
        d.merchant_id,
        d.product_id,
        d.date,
        d.quantity,
        d.revenue
      ]);

      const query = `
        INSERT INTO merchant_sales (merchant_id, product_id, date, quantity, revenue)
        VALUES ${values}
        ON CONFLICT (merchant_id, product_id, date) DO UPDATE SET
          quantity = EXCLUDED.quantity,
          revenue = EXCLUDED.revenue
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

    console.log(`\n   ✓ Generated ${data.length} sales records`);
    return data.length;

  } catch (error) {
    console.error(`✗ Error generating data for merchant ${merchantId}:`, error.message);
    throw error;
  }
}

/**
 * Get all merchants from database
 */
async function getAllMerchants() {
  try {
    const result = await pool.query(
      'SELECT id, name FROM users WHERE role = \'merchant\' ORDER BY id'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching merchants:', error.message);
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
        COUNT(*) as total_records,
        COUNT(DISTINCT date) as days_with_data,
        AVG(quantity) as avg_daily_quantity,
        MIN(quantity) as min_quantity,
        MAX(quantity) as max_quantity,
        ROUND(SUM(revenue)::numeric, 2) as total_revenue,
        ROUND(AVG(revenue)::numeric, 2) as avg_revenue
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
  console.log(`\nGenerating ${HISTORICAL_DAYS} days of historical sales data`);
  console.log(`for all merchants in the system...\n`);

  let totalRecords = 0;
  const stats = {};

  try {
    // Get all merchants
    const merchants = await getAllMerchants();

    if (merchants.length === 0) {
      console.error('No merchants found in database!');
      process.exit(1);
    }

    console.log(`Found ${merchants.length} merchants to process:\n`);
    merchants.forEach((m, idx) => {
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
    console.log(`\n✓ Total records generated: ${totalRecords}\n`);

    console.log('Merchant Statistics:');
    console.log('-'.repeat(80));
    console.log(
      'Merchant ID | Name                  | Days | Avg Qty | Min/Max | Total Revenue'.padEnd(80)
    );
    console.log('-'.repeat(80));

    Object.entries(stats).forEach(([merchantId, stat]) => {
      const line = [
        String(merchantId).padEnd(11),
        stat.name.slice(0, 20).padEnd(22),
        String(stat.days_with_data).padEnd(5),
        String(Math.round(stat.avg_daily_quantity)).padEnd(8),
        `${stat.min_quantity}/${stat.max_quantity}`.padEnd(8),
        `$${stat.total_revenue}`
      ].join('| ');
      console.log(line);
    });

    console.log('-'.repeat(80));

    // Verify data integrity
    console.log('\nData Integrity Checks:');
    const totalCheck = await pool.query('SELECT COUNT(*) as count FROM merchant_sales');
    console.log(`✓ Total merchant_sales records: ${totalCheck.rows[0].count}`);

    const merchantCheck = await pool.query(
      'SELECT COUNT(DISTINCT merchant_id) as count FROM merchant_sales'
    );
    console.log(`✓ Merchants with data: ${merchantCheck.rows[0].count}`);

    const dateRangeCheck = await pool.query(`
      SELECT
        MIN(date) as earliest,
        MAX(date) as latest,
        COUNT(DISTINCT date) as unique_days
      FROM merchant_sales
    `);
    console.log(`✓ Date range: ${dateRangeCheck.rows[0].earliest} to ${dateRangeCheck.rows[0].latest}`);
    console.log(`✓ Days with data: ${dateRangeCheck.rows[0].unique_days}`);

    console.log('\n' + '='.repeat(80));
    console.log('✓ Data generation successful!');
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
