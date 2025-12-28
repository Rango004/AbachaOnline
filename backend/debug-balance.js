const db = require('./src/config/database');

async function checkBalance() {
  try {
    const result = await db.query(`
      SELECT u.name, tc.balance, 
             (SELECT SUM(amount) FROM token_transactions WHERE user_id = u.id AND type = 'credit') as total_credits,
             (SELECT SUM(amount) FROM token_transactions WHERE user_id = u.id AND type = 'debit') as total_debits
      FROM users u
      LEFT JOIN token_credits tc ON u.id = tc.user_id
      WHERE u.name = 'john'
    `);
    
    console.log('Balance check:', result.rows[0]);
    
    const transactions = await db.query(`
      SELECT * FROM token_transactions 
      WHERE user_id = (SELECT id FROM users WHERE name = 'john')
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log('\nRecent transactions:', transactions.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkBalance();
