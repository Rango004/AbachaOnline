#!/usr/bin/env node
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'wego_dev'
});

async function checkResults() {
  try {
    console.log('\n📊 FORECAST GENERATION RESULTS\n');
    
    // Get count by merchant
    const resultByMerchant = await pool.query(`
      SELECT 
        sp.merchant_id,
        u.name as merchant_name,
        COUNT(sp.id) as prediction_count,
        COUNT(DISTINCT sp.product_id) as unique_products,
        MIN(sp.created_at) as first_prediction,
        MAX(sp.created_at) as latest_prediction
      FROM sales_predictions sp
      LEFT JOIN users u ON sp.merchant_id = u.id
      WHERE sp.created_at > NOW() - INTERVAL '1 hour'
      GROUP BY sp.merchant_id, u.name
      ORDER BY sp.merchant_id
    `);
    
    console.log('Forecasts by Merchant:');
    console.log('─'.repeat(80));
    let totalPredictions = 0;
    resultByMerchant.rows.forEach(row => {
      console.log(
        `Merchant ${row.merchant_id.toString().padEnd(3)} (${(row.merchant_name || 'Unknown').padEnd(25)}): ${row.prediction_count.toString().padEnd(5)} predictions | ${row.unique_products} products`
      );
      totalPredictions += row.prediction_count;
    });
    
    console.log('─'.repeat(80));
    console.log(`\nTotal new predictions: ${totalPredictions}`);
    
    // Overall counts
    const totalCount = await pool.query('SELECT COUNT(*) as total FROM sales_predictions');
    console.log(`Total predictions in database: ${totalCount.rows[0].total}`);
    
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkResults();
