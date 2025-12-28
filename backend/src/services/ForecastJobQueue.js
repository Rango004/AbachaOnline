const Queue = require('bull');
const redis = require('../config/redis');
const db = require('../config/database');
const SalesPredictionService = require('./SalesPredictionService');

/**
 * ForecastJobQueue - Manages scheduled forecast generation for all merchants
 * Runs daily at 2 AM to generate sales predictions for all active merchants
 */
class ForecastJobQueue {
  constructor() {
    this.queue = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the forecast job queue
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        console.log('[ForecastQueue] Already initialized');
        return;
      }

      // Check if Redis is configured (required for job queues)
      const redisUrl = process.env.REDIS_URL;
      if (!redisUrl) {
        console.log('[ForecastQueue] REDIS_URL not configured - queue disabled. Add Redis service in Railway to enable job queues.');
        return;
      }

      // Create Bull queue connected to Redis using REDIS_URL
      this.queue = new Queue('merchant-forecasts', redisUrl);

      // Process jobs
      this.queue.process('merchant-forecast', async (job) => {
        return await this.processForecastJob(job);
      });

      this.queue.process('generate-all-forecasts', async (job) => {
        return await this.processForecastJob(job);
      });

      // Event listeners
      this.queue.on('completed', (job) => {
        console.log(`[ForecastQueue] Job ${job.id} completed:`, job.data);
      });

      this.queue.on('failed', (job, err) => {
        console.error(`[ForecastQueue] Job ${job.id} failed:`, err.message);
      });

      this.queue.on('error', (err) => {
        console.error('[ForecastQueue] Queue error:', err);
      });

      // Schedule recurring job at 2 AM daily
      await this.scheduleRecurringForecasts();

      this.isInitialized = true;
      console.log('[ForecastQueue] Initialized successfully');
    } catch (error) {
      console.error('[ForecastQueue] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Schedule recurring forecast generation (daily at 2 AM)
   * @returns {Promise<void>}
   */
  async scheduleRecurringForecasts() {
    try {
      // Remove any existing recurring jobs
      const repeatableJobs = await this.queue.getRepeatableJobs();
      for (const job of repeatableJobs) {
        if (job.name === 'generate-all-forecasts') {
          await this.queue.removeRepeatableByKey(job.key);
        }
      }

      // Schedule new job for 2 AM daily
      await this.queue.add(
        'generate-all-forecasts',
        { timestamp: new Date().toISOString() },
        {
          repeat: {
            cron: '0 2 * * *', // 2 AM every day
            tz: 'UTC'
          },
          removeOnComplete: false,
          removeOnFail: false,
          jobId: 'daily-forecast-generation'
        }
      );

      console.log('[ForecastQueue] Scheduled daily forecast generation at 2 AM UTC');
    } catch (error) {
      console.error('[ForecastQueue] Error scheduling recurring jobs:', error);
      throw error;
    }
  }

  /**
   * Process forecast job for all merchants
   * @param {Object} job - Bull job object
   * @returns {Promise<Object>} Job result summary
   */
  async processForecastJob(job) {
    try {
      console.log(`[ForecastQueue] Starting forecast generation job ${job.id} at ${new Date().toISOString()}`);

      // Get all active merchants
      const merchantsResult = await db.query(
        `SELECT id, name FROM users WHERE role = 'merchant' AND is_verified = true`
      );

      const merchants = merchantsResult.rows;
      console.log(`[ForecastQueue] Processing forecasts for ${merchants.length} merchants`);

      const results = {
        total_merchants: merchants.length,
        successful: [],
        failed: [],
        summary: {
          total_processed: 0,
          total_succeeded: 0,
          total_failed: 0,
          duration_ms: 0
        }
      };

      const startTime = Date.now();

      // Process each merchant's forecast
      for (const merchant of merchants) {
        try {
          console.log(`[ForecastQueue] Generating forecasts for merchant ${merchant.id} (${merchant.name})`);

          const forecastResult = await SalesPredictionService.generateProductForecasts(merchant.id);

          results.successful.push({
            merchant_id: merchant.id,
            merchant_name: merchant.name,
            successful_count: forecastResult.summary.successful_count,
            failed_count: forecastResult.summary.failed_count,
            total_count: forecastResult.summary.total
          });

          results.summary.total_succeeded++;

          console.log(
            `[ForecastQueue] Merchant ${merchant.id}: ${forecastResult.summary.successful_count}/${forecastResult.summary.total} forecasts generated`
          );
        } catch (error) {
          results.failed.push({
            merchant_id: merchant.id,
            merchant_name: merchant.name,
            error: error.message
          });

          results.summary.total_failed++;

          console.error(`[ForecastQueue] Merchant ${merchant.id} failed:`, error.message);
        }

        results.summary.total_processed++;
      }

      const duration = Date.now() - startTime;
      results.summary.duration_ms = duration;

      console.log(
        `[ForecastQueue] Forecast generation completed: ${results.summary.total_succeeded}/${results.summary.total_processed} merchants succeeded in ${duration}ms`
      );

      // Store job results in Redis for monitoring
      const jobResultsKey = `forecast:job:${job.id}:results`;
      await redis.setex(jobResultsKey, 604800, JSON.stringify(results)); // 7 days expiry

      return results;
    } catch (error) {
      console.error('[ForecastQueue] Job processing error:', error);
      throw error;
    }
  }

  /**
   * Manually trigger forecast generation for a specific merchant
   * @param {Number} merchantId - Merchant ID
   * @returns {Promise<Object>} Job object
   */
  async triggerMerchantForecast(merchantId) {
    try {
      if (!this.queue) {
        throw new Error('Queue not initialized');
      }

      const job = await this.queue.add(
        'merchant-forecast',
        { merchant_id: merchantId, triggered_at: new Date().toISOString() },
        {
          priority: 1, // High priority for manual triggers
          removeOnComplete: false,
          removeOnFail: false
        }
      );

      console.log(`[ForecastQueue] Triggered forecast generation for merchant ${merchantId}, job ID: ${job.id}`);
      return job;
    } catch (error) {
      console.error('[ForecastQueue] Error triggering merchant forecast:', error);
      throw error;
    }
  }

  /**
   * Manually trigger forecast generation for all merchants
   * @returns {Promise<Object>} Job object
   */
  async triggerAllMerchantForecasts() {
    try {
      if (!this.queue) {
        throw new Error('Queue not initialized');
      }

      const job = await this.queue.add(
        'generate-all-forecasts',
        { triggered_at: new Date().toISOString(), manual_trigger: true },
        {
          priority: 2, // Standard priority for manual triggers
          removeOnComplete: false,
          removeOnFail: false
        }
      );

      console.log(`[ForecastQueue] Triggered all-merchant forecast generation, job ID: ${job.id}`);
      return job;
    } catch (error) {
      console.error('[ForecastQueue] Error triggering all forecasts:', error);
      throw error;
    }
  }

  /**
   * Get job status and progress
   * @param {Number} jobId - Bull job ID
   * @returns {Promise<Object>} Job status
   */
  async getJobStatus(jobId) {
    try {
      if (!this.queue) {
        throw new Error('Queue not initialized');
      }

      const job = await this.queue.getJob(jobId);
      if (!job) {
        return { error: 'Job not found' };
      }

      const state = await job.getState();
      const progress = job._progress;

      return {
        id: job.id,
        name: job.name,
        state: state,
        progress: progress,
        attempts: job.attemptsMade,
        max_attempts: job.opts.attempts,
        data: job.data,
        result: job.returnvalue,
        failed_reason: job.failedReason
      };
    } catch (error) {
      console.error('[ForecastQueue] Error getting job status:', error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   * @returns {Promise<Object>} Queue stats
   */
  async getQueueStats() {
    try {
      if (!this.queue) {
        throw new Error('Queue not initialized');
      }

      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.queue.getWaitingCount(),
        this.queue.getActiveCount(),
        this.queue.getCompletedCount(),
        this.queue.getFailedCount(),
        this.queue.getDelayedCount()
      ]);

      return {
        waiting,
        active,
        completed,
        failed,
        delayed,
        total: waiting + active + completed + failed + delayed
      };
    } catch (error) {
      console.error('[ForecastQueue] Error getting queue stats:', error);
      throw error;
    }
  }

  /**
   * Clean up queue resources
   * @returns {Promise<void>}
   */
  async close() {
    try {
      if (this.queue) {
        await this.queue.close();
        console.log('[ForecastQueue] Queue closed');
      }
    } catch (error) {
      console.error('[ForecastQueue] Error closing queue:', error);
    }
  }
}

module.exports = new ForecastJobQueue();
