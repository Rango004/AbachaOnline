const db = require('./src/config/database');

async function checkMerchantMapping() {
  try {
    console.log('=== Checking User to Merchant Mapping ===\n');

    // Check merchant user
    const userResult = await db.query(`
      SELECT id, phone, role FROM users WHERE role = 'merchant' LIMIT 5
    `);

    console.log('[OK] Merchant users:');
    userResult.rows.forEach(user => {
      console.log(`  - User ID: ${user.id}, Phone: ${user.phone}, Role: ${user.role}`);
    });

    // Check merchants
    console.log('\n[OK] Merchants table:');
    const merchantResult = await db.query(`
      SELECT id, user_id, name FROM merchants LIMIT 5
    `);
    merchantResult.rows.forEach(m => {
      console.log(`  - Merchant ID: ${m.id}, User ID: ${m.user_id}, Name: ${m.name}`);
    });

    // Check merchant 3
    console.log('\n[OK] Merchant 3 details:');
    const m3Result = await db.query(`
      SELECT id, user_id, name FROM merchants WHERE id = 3
    `);
    if (m3Result.rows.length > 0) {
      console.log(`  - Merchant ID: ${m3Result.rows[0].id}`);
      console.log(`  - User ID: ${m3Result.rows[0].user_id}`);
      console.log(`  - Name: ${m3Result.rows[0].name}`);
    }

    // Check sales_predictions table merchant_id values
    console.log('\n[OK] Sales predictions merchant_id values:');
    const predResult = await db.query(`
      SELECT DISTINCT merchant_id, COUNT(*) as count
      FROM sales_predictions
      GROUP BY merchant_id
    `);
    predResult.rows.forEach(p => {
      console.log(`  - Merchant ID: ${p.merchant_id}, Count: ${p.count}`);
    });

  } catch(err) {
    console.error('[ERROR]', err.message);
  }
}

checkMerchantMapping().then(() => process.exit(0));
