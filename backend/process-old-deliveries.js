const db = require('./src/config/database');
const MerchantPaymentService = require('./src/services/MerchantPaymentService');

async function processOldDeliveries() {
  try {
    // Get all delivered orders with held escrow
    const result = await db.query(`
      SELECT o.id, o.merchant_id, o.total_amount
      FROM orders o
      JOIN escrow e ON o.id = e.order_id
      WHERE o.order_status = 'delivered'
      AND e.status = 'held'
      ORDER BY o.id
    `);

    console.log(`Found ${result.rows.length} delivered orders with held escrow\n`);

    for (const order of result.rows) {
      try {
        await MerchantPaymentService.processMerchantPayment(order.id);
        console.log(`✅ Order #${order.id}: Credited Le ${order.total_amount} to merchant ${order.merchant_id}`);
      } catch (err) {
        console.log(`❌ Order #${order.id}: ${err.message}`);
      }
    }

    console.log('\n✅ Processing complete');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

processOldDeliveries();
