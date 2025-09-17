const redis = require('redis');
const { logger } = require('../utils/logger');

let client = null;

const getRedisClient = () => {
  if (!client) {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis connection refused');
          return new Error('Redis server connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          logger.error('Redis max attempts reached');
          return new Error('Max attempts reached');
        }
        // Exponential backoff
        return Math.min(options.attempt * 100, 3000);
      }
    });

    client.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
    });

    client.on('connect', () => {
      logger.info('Redis client connected');
    });

    client.on('disconnect', () => {
      logger.warn('Redis client disconnected');
    });

    // Connect to Redis
    client.connect().catch(err => {
      logger.error('Failed to connect to Redis', { error: err.message });
    });
  }

  return client;
};

const closeRedisConnection = async () => {
  if (client) {
    await client.quit();
    client = null;
    logger.info('Redis connection closed');
  }
};

module.exports = {
  getRedisClient,
  closeRedisConnection
};