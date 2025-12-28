#!/usr/bin/env node
/**
 * Trigger forecast generation for all merchants using admin endpoint
 * This must be run by an admin user
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';

// Admin token - replace with valid admin JWT
// For now, using a test token structure
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwicGhvbmUiOiIrMjMyNzYwMDAwMDAwIiwiaWF0IjoxNzY0MTA3MTM5LCJleHAiOjE3NjQxMDgwMzl9.test';

async function triggerAllForecasts() {
  try {
    console.log('================================================================================');
    console.log('TRIGGERING FORECAST GENERATION FOR ALL MERCHANTS');
    console.log('================================================================================\n');

    console.log('📊 Calling admin endpoint: POST /api/v1/admin/predictions/refresh-all');

    const response = await axios.post(
      `${API_BASE}/admin/predictions/refresh-all`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Forecast generation triggered successfully!\n');
    console.log('Response:');
    console.log(`  Job ID: ${response.data.job_id}`);
    console.log(`  Job Name: ${response.data.job_name}`);
    console.log(`  Status: ${response.data.status}`);
    console.log(`  Timestamp: ${response.data.timestamp}`);

    console.log('\n📝 Note: Forecasts are being generated in the background.');
    console.log('   This may take a few minutes depending on data volume.\n');

    // Wait a bit then check stats
    console.log('Waiting 5 seconds before checking queue stats...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
      const statsResponse = await axios.get(
        `${API_BASE}/admin/predictions/queue/stats`,
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`
          }
        }
      );

      console.log('Queue Statistics:');
      console.log(JSON.stringify(statsResponse.data.data, null, 2));
    } catch (statsErr) {
      console.log('Could not retrieve queue stats (this is normal if queue service is not available)');
    }

  } catch (error) {
    if (error.response?.status === 401) {
      console.error('❌ Unauthorized - Admin token invalid or expired');
    } else if (error.response?.status === 403) {
      console.error('❌ Forbidden - Only admins can trigger forecasts');
    } else if (error.response?.status === 404) {
      console.error('❌ Endpoint not found - API structure may be different');
    } else {
      console.error('❌ Error:', error.response?.data?.message || error.message);
    }
    process.exit(1);
  }
}

triggerAllForecasts().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
