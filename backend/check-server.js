require('dotenv').config();
const http = require('http');

const checks = [
  { name: 'Backend API', url: 'http://localhost:3000/health' },
  { name: 'Database', url: 'http://localhost:3000/health/db' },
  { name: 'API Info', url: 'http://localhost:3000/api/v1' }
];

async function checkServer(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    }).on('error', (err) => {
      resolve({ status: 'error', message: err.message });
    });
  });
}

async function runChecks() {
  console.log('🔍 Checking server status...\n');
  
  for (const check of checks) {
    const result = await checkServer(check.url);
    
    if (result.status === 200) {
      console.log(`✅ ${check.name}: OK`);
      if (result.data.status) console.log(`   Status: ${result.data.status}`);
      if (result.data.database) console.log(`   Database: ${result.data.database}`);
    } else if (result.status === 'error') {
      console.log(`❌ ${check.name}: ${result.message}`);
    } else {
      console.log(`⚠️  ${check.name}: Status ${result.status}`);
    }
  }
  
  console.log('\n📋 Configuration:');
  console.log(`   Backend: http://localhost:3000`);
  console.log(`   Frontend: http://localhost:8080`);
  console.log(`   Database: ${process.env.DATABASE_URL}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
}

runChecks();