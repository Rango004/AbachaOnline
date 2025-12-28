const redis = require('redis');
require('dotenv').config();

// Check if Redis is configured
const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST;
const redisEnabled = redisUrl || (redisHost && redisHost !== 'localhost');

let client = null;
let isConnected = false;

if (redisEnabled) {
  // Create Redis client only if configured
  const redisConfig = redisUrl
    ? { url: redisUrl }
    : {
        socket: {
          host: redisHost,
          port: process.env.REDIS_PORT || 6379,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Max Redis reconnection attempts reached');
              return new Error('Max retries');
            }
            return retries * 50;
          }
        }
      };

  client = redis.createClient(redisConfig);

  // Handle connection events
  client.on('connect', () => {
    isConnected = true;
    console.log('✅ Redis connected successfully');
  });

  client.on('error', (err) => {
    isConnected = false;
    // Only log once, not on every reconnect attempt
  });

  client.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
  });

  // Connect to Redis
  client.connect().catch(err => {
    console.error('Failed to connect to Redis:', err.message);
  });
} else {
  console.log('ℹ️  Redis not configured - running without Redis (job queues disabled)');
}

// Wrapper methods for compatibility - return null/false if Redis not available
const get = async (key) => {
  if (!client || !isConnected) return null;
  try {
    return await client.get(key);
  } catch (error) {
    console.error(`Redis GET error for ${key}:`, error.message);
    return null;
  }
};

const set = async (key, value, options = {}) => {
  if (!client || !isConnected) return false;
  try {
    const redisOptions = {};
    if (options.EX) {
      redisOptions.EX = options.EX;
    }
    return await client.set(key, value, redisOptions);
  } catch (error) {
    console.error(`Redis SET error for ${key}:`, error.message);
    return false;
  }
};

const setex = async (key, seconds, value) => {
  if (!client || !isConnected) return false;
  try {
    return await client.setEx(key, seconds, value);
  } catch (error) {
    console.error(`Redis SETEX error for ${key}:`, error.message);
    return false;
  }
};

const del = async (key) => {
  if (!client || !isConnected) return false;
  try {
    return await client.del(key);
  } catch (error) {
    console.error(`Redis DEL error for ${key}:`, error.message);
    return false;
  }
};

const exists = async (key) => {
  if (!client || !isConnected) return false;
  try {
    return await client.exists(key);
  } catch (error) {
    console.error(`Redis EXISTS error for ${key}:`, error.message);
    return false;
  }
};

// Check if Redis is available
const isAvailable = () => {
  return client !== null && isConnected;
};

module.exports = {
  client,
  get,
  set,
  setex,
  del,
  exists,
  isAvailable,
  isEnabled: redisEnabled
};
