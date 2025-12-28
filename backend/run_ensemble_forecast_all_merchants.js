#!/usr/bin/env node
/**
 * Run ensemble forecasting for all merchants using newly generated sales data
 * Uses the merchant_sales table to generate predictions
 */

const { Pool } = require('pg');
const axios = require('axios');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'wego_dev'
});

const API_BASE = 'http://localhost:3000/api/v1';

// JWT token for authentication (merchant token)
const MERCHANT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6Im1lcmNoYW50IiwicGhvbmUiOiIrMjMyNzY4ODgwMDAxIiwiaWF0IjoxNzY1MjY2NjQzLCJleHAiOjE3Njc4NTg2NDN9.U9G4CDOQjBCL4awoqXE7ZpWjav6uqkCKLUFsHY4ZIzA';

async function getMerchants() {
  try {
    const result = await pool.query('SELECT id, name FROM users WHERE role = \'merchant\' ORDER BY id');
    return result.rows;
  } catch (err) {
    console.error('Error fetching merchants:', err.message);
    return [];
  }
}

async function getMerchantSalesData(merchantId, days = 90) {
  try {
    const result = await pool.query(`
      SELECT
        DATE(sale_date) as date,
        COALESCE(SUM(quantity), 0) as quantity,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM merchant_sales
      WHERE merchant_id = $1
        AND sale_date >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(sale_date)
      ORDER BY date ASC
    `, [merchantId]);

    return result.rows;
  } catch (err) {
    console.error(`Error fetching sales data for merchant ${merchantId}:`, err.message);
    return [];
  }
}

async function testMerchantForecast(merchantId, merchantName) {
  try {
    console.log(`\n📊 Testing ensemble forecast for Merchant ${merchantId} (${merchantName})...`);

    // Get historical data
    const salesData = await getMerchantSalesData(merchantId);
    console.log(`   Historical data points: ${salesData.length} days`);

    if (salesData.length < 30) {
      console.log(`   ⚠️  Insufficient data (${salesData.length} days, need 30+)`);
      return null;
    }

    // Call the API endpoint to get ensemble forecast
    try {
      const response = await axios.get(`${API_BASE}/merchant/predictions/ensemble`, {
        headers: {
          'Authorization': `Bearer ${MERCHANT_TOKEN}`
        }
      });

      if (response.status === 200 && response.data.success) {
        const forecast = response.data.data;
        console.log(`   ✅ Ensemble forecast retrieved successfully`);
        console.log(`      Forecast Type: ${forecast.forecast_type}`);
        console.log(`      Horizon: ${forecast.forecast_horizon || 'N/A'} days`);
        console.log(`      Confidence: ${forecast.layer4_confidence || 'N/A'}%`);
        return forecast;
      } else {
        console.log(`   ⚠️  No forecast data available`);
        return null;
      }
    } catch (apiErr) {
      if (apiErr.response?.status === 404) {
        console.log(`   ⚠️  No forecast exists yet (404)`);
        return null;
      } else if (apiErr.response?.status === 403) {
        console.log(`   ⚠️  Authorization failed (403)`);
        return null;
      }
      throw apiErr;
    }
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('================================================================================');
  console.log('ENSEMBLE FORECASTING TEST - MULTI-MERCHANT DATA');
  console.log('================================================================================');
  console.log('\nTesting API endpoints with newly generated merchant_sales data...\n');

  try {
    const merchants = await getMerchants();

    if (merchants.length === 0) {
      console.error('❌ No merchants found!');
      process.exit(1);
    }

    console.log(`Found ${merchants.length} merchants\n`);

    const results = [];
    let successCount = 0;

    for (const merchant of merchants) {
      const forecast = await testMerchantForecast(merchant.id, merchant.name);
      results.push({
        merchant_id: merchant.id,
        name: merchant.name,
        forecast: forecast
      });

      if (forecast) {
        successCount++;
      }
    }

    // Summary
    console.log('\n================================================================================');
    console.log('FORECAST TEST SUMMARY');
    console.log('================================================================================');
    console.log(`\nTotal merchants: ${merchants.length}`);
    console.log(`Forecasts retrieved: ${successCount}/${merchants.length}`);
    console.log(`Success rate: ${((successCount / merchants.length) * 100).toFixed(1)}%\n`);

    // Show forecast data
    if (successCount > 0) {
      console.log('Merchant Forecasts:');
      console.log('-'.repeat(80));
      results.forEach(r => {
        if (r.forecast) {
          console.log(`${r.merchant_id.toString().padEnd(3)} | ${r.name.padEnd(30)} | Type: ${r.forecast.forecast_type}`);
        }
      });
      console.log('-'.repeat(80));
    }

    console.log('\n✅ Test complete!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
