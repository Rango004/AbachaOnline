#!/usr/bin/env node
/**
 * Trigger forecast generation for all merchants with CSRF token handling
 */

const { Pool } = require('pg');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'wego_dev'
});

const API_BASE = 'http://localhost:3000/api/v1';
const JWT_SECRET = process.env.JWT_SECRET || 'wego-development-secret-key-change-this-in-production-32chars';

// Create axios instance with cookie jar for CSRF token
const axiosInstance = axios.create({
  withCredentials: true
});

async function getCsrfToken() {
  try {
    console.log('🔐 Getting CSRF token...');
    const response = await axiosInstance.get(`${API_BASE}/csrf-token`);
    const csrfToken = response.data.csrfToken;
    console.log('✅ CSRF token obtained');
    return csrfToken;
  } catch (error) {
    console.error('❌ Failed to get CSRF token:', error.message);
    return null;
  }
}

async function getAdminToken() {
  try {
    const token = jwt.sign(
      {
        id: 1,
        role: 'admin',
        phone: '+23276000000',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      },
      JWT_SECRET,
      { algorithm: 'HS256' }
    );
    return token;
  } catch (err) {
    console.error('Error creating token:', err.message);
    return null;
  }
}

async function getAllMerchants() {
  try {
    const result = await pool.query(
      'SELECT id, name FROM users WHERE role = \'merchant\' ORDER BY id'
    );
    return result.rows;
  } catch (err) {
    console.error('Error fetching merchants:', err.message);
    return [];
  }
}

async function triggerMerchantForecast(merchantId, adminToken, csrfToken) {
  try {
    const response = await axiosInstance.post(
      `${API_BASE}/admin/predictions/refresh-merchant/${merchantId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        timeout: 15000
      }
    );

    return {
      success: true,
      status: response.status,
      jobId: response.data.job_id,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      error: error.code
    };
  }
}

async function main() {
  console.log('═'.repeat(80));
  console.log('FORECAST GENERATION TRIGGER - ALL MERCHANTS (WITH CSRF)');
  console.log('═'.repeat(80));

  try {
    // Get CSRF token
    console.log('\n🔑 Setting up authentication...');
    const csrfToken = await getCsrfToken();

    if (!csrfToken) {
      console.error('❌ Failed to get CSRF token');
      process.exit(1);
    }

    // Get admin token
    const adminToken = await getAdminToken();

    if (!adminToken) {
      console.error('❌ Failed to generate admin token');
      process.exit(1);
    }
    console.log('✅ Admin token generated');

    // Get merchants
    console.log('\n📋 Fetching merchants...');
    const merchants = await getAllMerchants();

    if (merchants.length === 0) {
      console.error('❌ No merchants found!');
      process.exit(1);
    }

    console.log(`✅ Found ${merchants.length} merchants\n`);

    // Trigger forecasts
    console.log('🚀 TRIGGERING FORECASTS');
    console.log('─'.repeat(80));

    let successCount = 0;
    const results = [];

    for (const merchant of merchants) {
      process.stdout.write(`\n Merchant ${merchant.id.toString().padEnd(3)} (${merchant.name.padEnd(25)}): `);

      const result = await triggerMerchantForecast(merchant.id, adminToken, csrfToken);

      if (result.success) {
        console.log('✅ Triggered');
        console.log(`   Job ID: ${result.jobId}`);
        successCount++;
      } else {
        if (result.status === 403) {
          console.log('⚠️  Forbidden (403)');
        } else if (result.status === 401) {
          console.log('⚠️  Unauthorized (401)');
        } else if (result.status === 404) {
          console.log('⚠️  Not Found (404)');
        } else {
          console.log(`⚠️  Error: ${result.message}`);
        }
      }

      results.push({
        merchantId: merchant.id,
        name: merchant.name,
        ...result
      });

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Summary
    console.log('\n' + '═'.repeat(80));
    console.log('TRIGGER SUMMARY');
    console.log('═'.repeat(80));
    console.log(`\nTotal merchants: ${merchants.length}`);
    console.log(`Successful triggers: ${successCount}/${merchants.length}`);
    console.log(`Success rate: ${((successCount / merchants.length) * 100).toFixed(1)}%\n`);

    if (successCount > 0) {
      console.log('✅ Forecasts triggered successfully!');
      console.log('   Forecasts are being generated in the background.');
      console.log('   Check progress: node run_ensemble_forecast_all_merchants.js\n');
    } else {
      console.log('⚠️  No forecasts were triggered.');
      console.log('   Check server logs for details.\n');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
