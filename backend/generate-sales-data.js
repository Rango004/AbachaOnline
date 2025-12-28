/**
 * Generate realistic sales data for the past 60+ days
 * This script creates order items with realistic patterns
 */

const db = require('./src/config/database');

// Realistic sales patterns based on product categories
const PATTERNS = {
  beverages: {
    baseDaily: 15,
    variance: 0.3,
    peakDays: [5, 6], // Friday, Saturday
    peakMultiplier: 1.5
  },
  snacks: {
    baseDaily: 10,
    variance: 0.25,
    peakDays: [5, 6],
    peakMultiplier: 1.4
  },
  stationery: {
    baseDaily: 8,
    variance: 0.4,
    peakDays: [0, 1, 2], // Mon, Tue, Wed (school days)
    peakMultiplier: 1.6
  },
  toiletries: {
    baseDaily: 5,
    variance: 0.2,
    peakDays: [6], // Sunday
    peakMultiplier: 1.3
  },
  default: {
    baseDaily: 7,
    variance: 0.3,
    peakDays: [5, 6],
    peakMultiplier: 1.4
  }
};

function getPattern(category) {
  if (!category) return PATTERNS.default;
  const key = Object.keys(PATTERNS).find(k => category.toLowerCase().includes(k));
  return PATTERNS[key] || PATTERNS.default;
}

function generateDailySales(baseDaily, variance, dayOfWeek, peakDays, peakMultiplier) {
  let quantity = baseDaily;

  // Add random variance (±variance%)
  quantity *= (1 + (Math.random() - 0.5) * variance * 2);

  // Apply peak day multiplier
  if (peakDays.includes(dayOfWeek)) {
    quantity *= peakMultiplier;
  }

  // Add some random noise
  quantity += (Math.random() - 0.5) * 2;

  return Math.max(1, Math.round(quantity));
}

function subtractDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

async function generateSalesData() {
  try {
    console.log('📊 Generating realistic sales data...\n');

    // Get merchants
    const merchantsResult = await db.query(
      `SELECT id FROM users WHERE role = 'merchant' LIMIT 5`
    );
    const merchants = merchantsResult.rows;

    if (merchants.length === 0) {
      console.log('❌ No merchants found');
      process.exit(0);
      return;
    }

    console.log(`Found ${merchants.length} merchants\n`);

    let totalOrders = 0;
    let totalItems = 0;

    for (const merchant of merchants) {
      const merchantId = merchant.id;
      console.log(`⏳ Processing merchant ${merchantId}...`);

      // Get products for this merchant
      const productsResult = await db.query(
        `SELECT id, name, category, price FROM products
         WHERE merchant_id = $1 LIMIT 10`,
        [merchantId]
      );

      if (productsResult.rows.length === 0) {
        console.log(`   ⚠️  No products found for merchant ${merchantId}`);
        continue;
      }

      const products = productsResult.rows;
      console.log(`   Found ${products.length} products`);

      // Generate 90 days of order history (more than 60 days required)
      const daysBack = 90;
      const now = new Date();

      for (let daysAgo = daysBack; daysAgo > 0; daysAgo--) {
        const date = subtractDays(now, daysAgo);

        // Generate 1-3 orders per day
        const ordersCount = Math.floor(Math.random() * 3) + 1;

        for (let orderIdx = 0; orderIdx < ordersCount; orderIdx++) {
          try {
            // Create order
            const orderResult = await db.query(
              `INSERT INTO orders (
                merchant_id,
                student_id,
                total_amount,
                order_status,
                created_at,
                updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING id`,
              [
                merchantId,
                Math.floor(Math.random() * 10) + 1, // Random student/customer
                Math.random() * 5000, // Random amount
                'delivered', // Status
                date,
                date
              ]
            );

            const orderId = orderResult.rows[0].id;
            totalOrders++;

            // Add 1-4 items to each order
            const itemsCount = Math.floor(Math.random() * 4) + 1;
            for (let itemIdx = 0; itemIdx < itemsCount; itemIdx++) {
              const product = products[Math.floor(Math.random() * products.length)];
              const pattern = getPattern(product.category);

              const quantity = generateDailySales(
                pattern.baseDaily,
                pattern.variance,
                date.getDay(),
                pattern.peakDays,
                pattern.peakMultiplier
              );

              await db.query(
                `INSERT INTO order_items (
                  order_id,
                  product_id,
                  quantity,
                  unit_price,
                  created_at
                ) VALUES ($1, $2, $3, $4, $5)`,
                [
                  orderId,
                  product.id,
                  quantity,
                  product.price,
                  date
                ]
              );
              totalItems++;
            }
          } catch (error) {
            if (error.code !== '42P01') { // Ignore "table does not exist" errors
              console.error(`   ⚠️  Error creating order: ${error.message}`);
            }
          }
        }
      }

      console.log(`   ✅ Generated 90 days of sales data for merchant ${merchantId}`);
    }

    console.log('\n✅ Sales data generation completed!\n');
    console.log('📈 Data Summary:');
    console.log(`  - Total orders created: ${totalOrders}`);
    console.log(`  - Total items created: ${totalItems}`);
    console.log('  - Time period: Last 90 days');
    console.log('  - Pattern: Realistic weekday/weekend variations');
    console.log('  - Categories: Beverages, Snacks, Stationery, Toiletries');
    console.log('  - Peak days: Weekends for most, school days for stationery');
    console.log('\n💡 Ready for sales predictions!');

  } catch (error) {
    console.error('❌ Error generating sales data:', error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
generateSalesData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
