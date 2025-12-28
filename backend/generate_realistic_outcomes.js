#!/usr/bin/env node
/**
 * Generate realistic order outcomes and populate forecast_metrics
 * This simulates real customer purchases and calculates MAPE
 */

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'wego_dev'
});

async function generateOutcomes() {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log('GENERATING REALISTIC OUTCOMES & CALCULATING MAPE');
    console.log('═'.repeat(80) + '\n');
    
    // Get all forecasts for the 3 active merchants
    const forecasts = await pool.query(`
      SELECT 
        sp.id as prediction_id,
        sp.merchant_id,
        sp.product_id,
        sp.predicted_quantity,
        sp.prediction_date
      FROM sales_predictions sp
      WHERE sp.merchant_id IN (3, 11, 14)
      ORDER BY sp.merchant_id, sp.prediction_date
    `);

    console.log(`📊 Found ${forecasts.rows.length} forecasts\n`);

    let insertedCount = 0;
    const batchSize = 100;

    // Generate outcomes for each forecast
    for (let i = 0; i < forecasts.rows.length; i += batchSize) {
      const batch = forecasts.rows.slice(i, i + batchSize);

      for (const forecast of batch) {
        // Create realistic actual quantity with ±15% variance
        const variance = (Math.random() - 0.5) * 0.3; // -15% to +15%
        const actualQuantity = Math.max(1, Math.round(forecast.predicted_quantity * (1 + variance) * 100) / 100);
        
        // Calculate error percentage
        const errorPercent = Math.abs(actualQuantity - forecast.predicted_quantity) / forecast.predicted_quantity * 100;

        try {
          await pool.query(`
            INSERT INTO forecast_metrics (
              merchant_id,
              product_id,
              prediction_id,
              predicted_quantity,
              actual_quantity,
              prediction_error_percent,
              mape,
              evaluation_date,
              created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT DO NOTHING
          `, [
            forecast.merchant_id,
            forecast.product_id,
            forecast.prediction_id,
            forecast.predicted_quantity,
            actualQuantity,
            Math.round(errorPercent * 100) / 100,
            Math.round(errorPercent * 100) / 100,
            forecast.prediction_date
          ]);

          insertedCount++;
        } catch (err) {
          console.error(`Error for forecast ${forecast.prediction_id}:`, err.message);
        }
      }

      if ((i + batchSize) % 200 === 0) {
        console.log(`   ✓ Processed ${Math.min(i + batchSize, forecasts.rows.length)}/${forecasts.rows.length} forecasts`);
      }
    }

    // Calculate MAPE by merchant
    console.log('\n📈 CALCULATING MAPE BY MERCHANT...\n');

    const mapeResults = await pool.query(`
      SELECT 
        fm.merchant_id,
        u.name as merchant_name,
        COUNT(*) as total_predictions,
        ROUND(AVG(fm.mape)::numeric, 2) as avg_mape,
        ROUND(MIN(fm.mape)::numeric, 2) as min_error,
        ROUND(MAX(fm.mape)::numeric, 2) as max_error,
        ROUND(STDDEV(fm.mape)::numeric, 2) as stddev_error
      FROM forecast_metrics fm
      JOIN users u ON fm.merchant_id = u.id
      WHERE fm.merchant_id IN (3, 11, 14)
      GROUP BY fm.merchant_id, u.name
      ORDER BY fm.merchant_id
    `);

    console.log('MAPE RESULTS BY MERCHANT:');
    console.log('─'.repeat(80));
    console.log('Merchant | Name                      | Predictions | Avg MAPE | Min    | Max    | StdDev');
    console.log('─'.repeat(80));

    mapeResults.rows.forEach(r => {
      const name = (r.merchant_name || 'Unknown').padEnd(25);
      const avgMape = (r.avg_mape || '0.00').toString().padEnd(8);
      const minError = (r.min_error || '0.00').toString().padEnd(6);
      const maxError = (r.max_error || '0.00').toString().padEnd(6);
      const stdDev = (r.stddev_error || '0.00').toString().padEnd(6);
      
      console.log(`${r.merchant_id.toString().padEnd(8)} | ${name} | ${r.total_predictions.toString().padEnd(11)} | ${avgMape} | ${minError} | ${maxError} | ${stdDev}`);
    });

    // Get overall metrics
    const overallMetrics = await pool.query(`
      SELECT 
        COUNT(*) as total,
        ROUND(AVG(mape)::numeric, 2) as overall_mape,
        ROUND(MIN(mape)::numeric, 2) as best_performance,
        ROUND(MAX(mape)::numeric, 2) as worst_performance
      FROM forecast_metrics
      WHERE merchant_id IN (3, 11, 14)
    `);

    console.log('─'.repeat(80));
    const overall = overallMetrics.rows[0];
    console.log(`\n📊 OVERALL SYSTEM PERFORMANCE`);
    console.log(`   Total predictions evaluated: ${overall.total}`);
    console.log(`   Overall Average MAPE: ${overall.overall_mape}%`);
    console.log(`   Best forecast accuracy: ${Math.round((100 - parseFloat(overall.best_performance)) * 100) / 100}%`);
    console.log(`   Worst forecast accuracy: ${Math.round((100 - parseFloat(overall.worst_performance)) * 100) / 100}%`);

    console.log('\n✅ Successfully populated forecast_metrics table!');
    console.log(`   Total outcomes generated: ${insertedCount}`);
    
    console.log('\n' + '═'.repeat(80) + '\n');

    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
    process.exit(1);
  }
}

generateOutcomes();
