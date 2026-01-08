require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/database');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

async function startServer() {
  try {
    // Test database connection
    console.log('🔗 Testing database connection...');
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Start server
    app.listen(PORT, HOST, () => {
      console.log(`\n🚀 Server running at http://${HOST}:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      // SECURITY: Never log database connection strings
      const dbHost = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).host : 'not configured';
      console.log(`🗄️  Database: Connected to ${dbHost}`);
      console.log(`\n✅ API ready for requests`);
      console.log(`\nHealth checks:`);
      console.log(`  - http://${HOST}:${PORT}/health`);
      console.log(`  - http://${HOST}:${PORT}/health/db`);
      console.log(`  - http://${HOST}:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();