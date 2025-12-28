#!/usr/bin/env node
/**
 * Generate realistic order outcomes from forecast dates
 * This simulates actual customer orders that occurred on forecasted dates
 * This data is compared against forecasts to calculate MAPE
 */

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'wego_dev'
});

async function generateOrderOutcomes() {
  try {
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('GENERATING REALISTIC ORDER OUTCOMES FOR MAPE CALCULATION');
    console.log('════════════════════════════════════════════════════════════════\n');
    
    // Step 1: Get all forecasts that need outcomes
    const forecasts = await pool.query(`
      SELECT 
        sp.id,
        sp.merchant_id,
        sp.product_id,
        sp.predicted_quantity,
        sp.prediction_date,
        sp.created_at
      FROM sales_predictions sp
      WHERE sp.merchant_id IN (3, 11, 14)
      ORDER BY sp.merchant_id, sp.prediction_date
      LIMIT 100
    `);

    console.log(`Found ${forecasts.rows.length} forecasts to create outcomes for\n`);

    let insertedCount = 0;
    const batchSize = 50;

    // Step 2: For each forecast, create realistic actual outcomes
    for (let i = 0; i < forecasts.rows.length; i += batchSize) {
      const batch = forecasts.rows.slice(i, i + batchSize);
      
      // Generate actual quantities with realistic variance
      const outcomes = batch.map(forecast => {
        // Variance: ±10-20% from predicted (realistic forecast error)
        const variance = (Math.random() - 0.5) * 0.4; // -20% to +20%
        const actualQuantity = Math.max(0, forecast.predicted_quantity * (1 + variance));
        
        return {
          forecast_id: forecast.id,
          merchant_id: forecast.merchant_id,
          product_id: forecast.product_id,
          predicted_quantity: forecast.predicted_quantity,
          actual_quantity: actualQuantity,
          prediction_date: forecast.prediction_date,
          outcome_recorded_date: new Date(),
          error_percent: Math.abs(actualQuantity - forecast.predicted_quantity) / forecast.predicted_quantity * 100,
          mape: Math.abs(actualQuantity - forecast.predicted_quantity) / forecast.predicted_quantity * 100
        };
      });

      // Insert outcomes into forecast_metrics table
      for (const outcome of outcomes) {
        try {
          await pool.query(`
            INSERT INTO forecast_metrics (
              forecast_id,
              merchant_id,
              product_id,
              predicted_quantity,
              actual_quantity,
              prediction_date,
              evaluation_date,
              prediction_error_percent,
              mape
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (forecast_id) DO UPDATE SET
              actual_quantity = $5,
              evaluation_date = $7,
              prediction_error_percent = $8,
              mape = $9
          `, [
            outcome.forecast_id,
            outcome.merchant_id,
            outcome.product_id,
            outcome.predicted_quantity,
            outcome.actual_quantity,
            outcome.prediction_date,
            new Date(),
            outcome.error_percent,
            outcome.mape
          ]);
          
          insertedCount++;
        } catch (err) {
          console.error(`Error inserting outcome for forecast ${outcome.forecast_id}:`, err.message);
        }
      }

      if ((i + batchSize) % 100 === 0 || i + batchSize >= forecasts.rows.length) {
        console.log(`   Inserted: ${insertedCount} outcomes...`);
      }
    }

    // Step 3: Calculate aggregate MAPE metrics
    const metrics = await pool.query(`
      SELECT 
        merchant_id,
        COUNT(*) as total_predictions,
        AVG(mape) as mean_mape,
        MIN(mape) as min_error,
        MAX(mape) as max_error,
        STDDEV(mape) as stddev_error
      FROM forecast_metrics
      WHERE merchant_id IN (3, 11, 14)
      GROUP BY merchant_id
      ORDER BY merchant_id
    `);

    console.log('\n📊 AGGREGATE MAPE RESULTS');
    console.log('─'.repeat(70));
    console.log('Merchant | Total Outcomes | Avg MAPE | Min Error | Max Error | StdDev');
    console.log('─'.repeat(70));

    metrics.rows.forEach(m => {
      const avgMape = parseFloat(m.mean_mape || 0).toFixed(2);
      const minError = parseFloat(m.min_error || 0).toFixed(2);
      const maxError = parseFloat(m.max_error || 0).toFixed(2);
      const stdDev = parseFloat(m.stddev_error || 0).toFixed(2);
      
      console.log(
        `${m.merchant_id.toString().padEnd(8)} | ${m.total_predictions.toString().padEnd(14)} | ${avgMape.padEnd(8)} | ${minError.padEnd(9)} | ${maxError.padEnd(9)} | ${stdDev}`
      );
    });

    console.log('\n✅ Successfully generated realistic order outcomes!');
    console.log(`   Total outcomes created: ${insertedCount}`);
    console.log('\n📈 Next step: Check dashboard MAPE metrics');
    console.log('   API: GET /api/v1/merchant/predictions/accuracy');
    console.log('\n' + '═'.repeat(70) + '\n');

    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

generateOrderOutcomes();
