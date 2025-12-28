const db = require('./src/config/database');

async function refundCancelled() {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Get user ID
    const userResult = await client.query(
      "SELECT id FROM users WHERE phone = '+23276424147'"
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const userId = userResult.rows[0].id;
    console.log('User ID:', userId);

    // Get all cancelled orders paid with token_credits
    const orders = await client.query(
      `SELECT id, total_amount FROM orders 
       WHERE student_id = $1 
       AND order_status = 'cancelled' 
       AND payment_method = 'token_credits'
       AND payment_status = 'completed'`,
      [userId]
    );

    console.log(`Found ${orders.rows.length} cancelled orders to refund`);

    let totalRefund = 0;
    for (const order of orders.rows) {
      const amount = parseFloat(order.total_amount);
      totalRefund += amount;
      console.log(`Order ${order.id}: Le ${amount}`);
    }

    if (totalRefund === 0) {
      console.log('No refunds needed');
      await client.query('ROLLBACK');
      process.exit(0);
    }

    // Add refund to balance
    await client.query(
      'UPDATE token_credits SET balance = balance + $1 WHERE user_id = $2',
      [totalRefund, userId]
    );

    const newBalanceResult = await client.query(
      'SELECT balance FROM token_credits WHERE user_id = $1',
      [userId]
    );

    // Record transaction
    await client.query(
      `INSERT INTO token_transactions (user_id, amount, type, balance_after)
       VALUES ($1, $2, 'credit', $3)`,
      [userId, totalRefund, parseFloat(newBalanceResult.rows[0].balance)]
    );

    await client.query('COMMIT');
    
    console.log(`\n✅ Refunded Le ${totalRefund}`);
    console.log(`New balance: Le ${newBalanceResult.rows[0].balance}`);
    
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

refundCancelled();
