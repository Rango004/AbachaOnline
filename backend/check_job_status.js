#!/usr/bin/env node
const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient({
  host: 'localhost',
  port: 6379,
  db: 0
});

async function checkJobs() {
  try {
    // Get all keys matching forecast jobs
    const keys = await promisify(client.keys).bind(client)('bull:forecast-jobs:*');
    console.log(`\nFound ${keys.length} forecast job keys\n`);
    
    // Get specific job data
    for (let i = 42; i <= 50; i++) {
      const jobKey = `bull:forecast-jobs:${i}`;
      const data = await promisify(client.get).bind(client)(jobKey);
      if (data) {
        const job = JSON.parse(data);
        console.log(`Job ${i}: progress=${job.progress}, delay=${job.delay}, attemptsMade=${job.attemptsMade}`);
      } else {
        console.log(`Job ${i}: Not found in Redis`);
      }
    }
    
    client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkJobs();
