// WeGo Backend Server
const app = require('./app');
const http = require('http');
const { Server: SocketIO } = require('socket.io');
const WebSocketService = require('./services/WebSocketService');
const ForecastJobQueue = require('./services/ForecastJobQueue');
const { runMigrations } = require('./config/migrations');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP server with Socket.IO
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 10000
});

// Initialize WebSocket service
const wsService = new WebSocketService(io);

// Handle WebSocket connections
io.on('connection', (socket) => {
  wsService.handleConnection(socket);
});

// Attach io instance to app for use in routes/services
app.locals.io = io;
app.locals.wsService = wsService;

// Initialize OrderService with WebSocket service
const OrderService = require('./services/OrderService');
OrderService.setWebSocketService(wsService);

// Initialize RASAChatbotService with WebSocket service
const RASAChatbotService = require('./services/RASAChatbotService');
RASAChatbotService.setWebSocketService(wsService);

// Initialize ChatService with WebSocket service
const ChatService = require('./services/ChatService');
ChatService.setWebSocketService(wsService);

// Run database migrations on startup
runMigrations().then(() => {
  console.log('[Server] Database migrations completed');
}).catch(err => {
  console.error('[Server] Migration error:', err.message);
});

// Initialize ForecastJobQueue
ForecastJobQueue.initialize().catch(err => {
  console.error('Failed to initialize ForecastJobQueue:', err);
  // Don't exit on queue initialization failure - continue running
});

// Initialize RouteOptimizationJobQueue
const RouteOptimizationJobQueue = require('./services/RouteOptimizationJobQueue');
RouteOptimizationJobQueue.initialize(io).catch(err => {
  console.error('Failed to initialize RouteOptimizationJobQueue:', err);
  // Don't exit on queue initialization failure - continue running
});

// Start server
server.listen(PORT, HOST, () => {
  console.log('='.repeat(50));
  console.log('🛍️  AbachaOnline Server Started');
  console.log('='.repeat(50));
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server: http://${HOST}:${PORT}`);
  console.log(`❤️  Health: http://${HOST}:${PORT}/health`);
  console.log(`🗄️  Database: http://${HOST}:${PORT}/health/db`);
  console.log(`📚 API Docs: http://${HOST}:${PORT}/api/v1`);
  console.log(`🔗 WebSocket: ws://${HOST}:${PORT}`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await ForecastJobQueue.close();
  await RouteOptimizationJobQueue.close();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await ForecastJobQueue.close();
  await RouteOptimizationJobQueue.close();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
