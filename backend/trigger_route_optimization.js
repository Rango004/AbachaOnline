const RouteOptimizationService = require('./src/services/RouteOptimizationService');
require('dotenv').config();

async function triggerRouteOptimization() {
  try {
    console.log('🚀 Starting route optimization...');
    
    // Get all merchants with pending orders
    const db = require('./src/config/database');
    const merchantsResult = await db.query(`
      SELECT DISTINCT o.merchant_id, u.name as merchant_name, COUNT(o.id) as pending_orders
      FROM orders o
      LEFT JOIN users u ON o.merchant_id = u.id
      WHERE o.order_status IN ('confirmed', 'preparing', 'ready')
        AND o.rider_id IS NULL
      GROUP BY o.merchant_id, u.name
      HAVING COUNT(o.id) > 0
      ORDER BY COUNT(o.id) DESC
    `);

    if (merchantsResult.rows.length === 0) {
      console.log('❌ No merchants with pending orders found');
      return;
    }

    console.log(`📊 Found ${merchantsResult.rows.length} merchants with pending orders:`);
    merchantsResult.rows.forEach(merchant => {
      console.log(`  - ${merchant.merchant_name} (ID: ${merchant.merchant_id}): ${merchant.pending_orders} orders`);
    });

    // Generate routes for each merchant
    for (const merchant of merchantsResult.rows) {
      console.log(`\n🔄 Optimizing routes for ${merchant.merchant_name}...`);
      
      try {
        const result = await RouteOptimizationService.generateOptimizedRoutes(merchant.merchant_id);
        
        if (result.success) {
          console.log(`✅ ${merchant.merchant_name}: ${result.message}`);
          console.log(`   - Routes created: ${result.routes.length}`);
          console.log(`   - Orders assigned: ${result.orders_assigned}`);
          console.log(`   - Riders assigned: ${result.riders_assigned}`);
        } else {
          console.log(`❌ ${merchant.merchant_name}: ${result.message}`);
        }
      } catch (error) {
        console.error(`❌ Error optimizing routes for ${merchant.merchant_name}:`, error.message);
      }
    }

    console.log('\n🎉 Route optimization completed!');
    
  } catch (error) {
    console.error('❌ Route optimization failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the optimization
triggerRouteOptimization();