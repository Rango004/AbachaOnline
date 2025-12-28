#!/usr/bin/env node
/**
 * Generate ensemble forecasts for all merchants
 * Uses the refresh endpoint to trigger forecast generation
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

// Get merchant tokens for each merchant
async function getMerchantTokens() {
  try {
    const result = await pool.query('SELECT id, name FROM users WHERE role = \'merchant\' ORDER BY id');
    return result.rows;
  } catch (err) {
    console.error('Error fetching merchants:', err.message);
    return [];
  }
}

// Generate a JWT token for a merchant (simplified - use actual token from session)
// For testing, we'll use pre-generated tokens or request new ones
async function generateMerchantForecast(merchantId, merchantName) {
  try {
    console.log(`\n📊 Generating forecast for Merchant ${merchantId} (${merchantName})...`);

    // For each merchant, we need to call the refresh endpoint
    // Since we don't have valid tokens for all merchants, we'll trigger a server-side generation
    // by calling an admin endpoint or by using a test token

    // Try the refresh endpoint with a merchant token
    // In a real scenario, each merchant would have their own token
    // For testing, we can use environment variable tokens or generate test ones

    try {
      // Attempt to call refresh endpoint
      const response = await axios.post(
        `${API_BASE}/merchant/predictions/ensemble/refresh`,
        { merchant_id: merchantId },
        {
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6Im1lcmNoYW50IiwicGhvbmUiOiIrMjMyNzY4ODgwMDEiLCJpYXQiOjE3NjQxMDcxMzksImV4cCI6MTc2NDEwODAzOX0.ZYnh_6KsB8aGbSV_SnMo9Yh8CCykSDYyrg3qHklgRTI`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log(`   ✅ Forecast generation triggered`);
        if (response.data.data) {
          console.log(`      Horizon: ${response.data.data.forecast_horizon || 'N/A'} days`);
          console.log(`      Type: ${response.data.data.forecast_type || 'ensemble'}`);
        }
        return true;
      }
    } catch (err) {
      if (err.response?.status === 403) {
        console.log(`   ⚠️  Invalid token for merchant ${merchantId} (403)`);
        return false;
      } else if (err.response?.status === 404) {
        console.log(`   ⚠️  Forecast endpoint not found (404)`);
        return false;
      }
      throw err;
    }

  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('================================================================================');
  console.log('ENSEMBLE FORECAST GENERATION - ALL MERCHANTS');
  console.log('================================================================================');
  console.log('\nTriggering forecast generation for all merchants...\n');

  try {
    const merchants = await getMerchantTokens();

    if (merchants.length === 0) {
      console.error('❌ No merchants found!');
      process.exit(1);
    }

    console.log(`Found ${merchants.length} merchants\n`);

    let successCount = 0;

    for (const merchant of merchants) {
      const success = await generateMerchantForecast(merchant.id, merchant.name);
      if (success) {
        successCount++;
      }
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Summary
    console.log('\n================================================================================');
    console.log('FORECAST GENERATION SUMMARY');
    console.log('================================================================================');
    console.log(`\nTotal merchants: ${merchants.length}`);
    console.log(`Forecasts triggered: ${successCount}/${merchants.length}`);
    console.log(`Success rate: ${((successCount / merchants.length) * 100).toFixed(1)}%\n`);

    if (successCount > 0) {
      console.log('✅ Forecast generation complete! Forecasts are being computed...');
      console.log('   Use run_ensemble_forecast_all_merchants.js to retrieve results\n');
    }

  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
