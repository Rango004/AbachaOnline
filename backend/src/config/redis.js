const redis = require('redis');
require('dotenv').config();

// Create Redis client
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Max Redis reconnection attempts reached');
        return new Error('Max retries');
      }
      return retries * 50;
    }
  }
});

// Handle connection events
client.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

client.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

client.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

// Connect to Redis
client.connect().catch(err => {
  console.error('Failed to connect to Redis:', err);
});

// Wrapper methods for compatibility
const get = async (key) => {
  try {
    return await client.get(key);
  } catch (error) {
    console.error(`Redis GET error for ${key}:`, error);
    throw error;
  }
};

const set = async (key, value, options = {}) => {
  try {
    const redisOptions = {};
    if (options.EX) {
      redisOptions.EX = options.EX;
    }
    return await client.set(key, value, redisOptions);
  } catch (error) {
    console.error(`Redis SET error for ${key}:`, error);
    throw error;
  }
};

const setex = async (key, seconds, value) => {
  try {
    return await client.setEx(key, seconds, value);
  } catch (error) {
    console.error(`Redis SETEX error for ${key}:`, error);
    throw error;
  }
};

const del = async (key) => {
  try {
    return await client.del(key);
  } catch (error) {
    console.error(`Redis DEL error for ${key}:`, error);
    throw error;
  }
};

const exists = async (key) => {
  try {
    return await client.exists(key);
  } catch (error) {
    console.error(`Redis EXISTS error for ${key}:`, error);
    throw error;
  }
};

module.exports = {
  client,
  get,
  set,
  setex,
  del,
  exists
};
