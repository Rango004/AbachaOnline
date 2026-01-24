#!/usr/bin/env node
/**
 * Fix Forecast Schema Migration
 * Adds missing columns to holidays_events, forecast_metrics, and sales_predictions tables.
 */

require('dotenv').config();
const { Pool } = require('pg');

const dbUrl = process.argv[2] || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl && dbUrl.includes('railway') ? { rejectUnauthorized: false } : false
});

const sql = [
  // holidays_events missing columns
  "ALTER TABLE holidays_events ADD COLUMN IF NOT EXISTS applies_to_categories VARCHAR(255)",
  "ALTER TABLE holidays_events ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Sierra Leone'",
  "ALTER TABLE holidays_events ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE",
  "ALTER TABLE holidays_events ADD COLUMN IF NOT EXISTS recurring_month INTEGER",
  "ALTER TABLE holidays_events ADD COLUMN IF NOT EXISTS recurring_day INTEGER",
  "ALTER TABLE holidays_events ADD COLUMN IF NOT EXISTS created_by INTEGER",
  "ALTER TABLE holidays_events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",

  // forecast_metrics missing columns
  "ALTER TABLE forecast_metrics ADD COLUMN IF NOT EXISTS product_id INTEGER",
  "ALTER TABLE forecast_metrics ADD COLUMN IF NOT EXISTS prediction_id INTEGER",
  "ALTER TABLE forecast_metrics ADD COLUMN IF NOT EXISTS predicted_quantity NUMERIC(10, 2)",
  "ALTER TABLE forecast_metrics ADD COLUMN IF NOT EXISTS actual_quantity NUMERIC(10, 2)",
  "ALTER TABLE forecast_metrics ADD COLUMN IF NOT EXISTS evaluation_date DATE",

  // sales_predictions missing columns
  "ALTER TABLE sales_predictions ADD COLUMN IF NOT EXISTS predicted_revenue NUMERIC(12, 2)",
  "ALTER TABLE sales_predictions ADD COLUMN IF NOT EXISTS confidence_level VARCHAR(10) DEFAULT '80'",
  "ALTER TABLE sales_predictions ADD COLUMN IF NOT EXISTS trend VARCHAR(20)",
  "ALTER TABLE sales_predictions ADD COLUMN IF NOT EXISTS seasonality_factor NUMERIC(5, 2)",
  "ALTER TABLE sales_predictions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",

  // sales_forecast_cache table
  `CREATE TABLE IF NOT EXISTS sales_forecast_cache (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cache_key VARCHAR(255) NOT NULL UNIQUE,
    forecast_data JSONB NOT NULL,
    forecast_type VARCHAR(50),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Indexes
  "CREATE INDEX IF NOT EXISTS idx_forecast_metrics_evaluation_date ON forecast_metrics(evaluation_date)",
  "CREATE INDEX IF NOT EXISTS idx_forecast_metrics_product ON forecast_metrics(product_id)",
  "CREATE INDEX IF NOT EXISTS idx_holidays_events_date ON holidays_events(event_date)",
  "CREATE INDEX IF NOT EXISTS idx_holidays_events_category ON holidays_events(category)",
  "CREATE INDEX IF NOT EXISTS idx_forecast_cache_merchant ON sales_forecast_cache(merchant_id)",
  "CREATE INDEX IF NOT EXISTS idx_forecast_cache_expires ON sales_forecast_cache(expires_at)"
];

async function run() {
  console.log('='.repeat(60));
  console.log('Fix Forecast Schema Migration');
  console.log('='.repeat(60));

  const client = await pool.connect();
  try {
    console.log('\nRunning migrations...\n');

    for (const statement of sql) {
      try {
        await client.query(statement);
        const short = statement.substring(0, 80).replace(/\n/g, ' ');
        console.log('OK:', short + (statement.length > 80 ? '...' : ''));
      } catch (err) {
        console.log('SKIP:', err.message);
      }
    }

    console.log('\nVerifying schema...\n');

    const heCols = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='holidays_events' ORDER BY ordinal_position"
    );
    console.log('holidays_events:', heCols.rows.map(r => r.column_name).join(', '));

    const fmCols = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='forecast_metrics' ORDER BY ordinal_position"
    );
    console.log('forecast_metrics:', fmCols.rows.map(r => r.column_name).join(', '));

    const spCols = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='sales_predictions' ORDER BY ordinal_position"
    );
    console.log('sales_predictions:', spCols.rows.map(r => r.column_name).join(', '));

    console.log('\n' + '='.repeat(60));
    console.log('Forecast schema fix complete!');
    console.log('='.repeat(60));
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
