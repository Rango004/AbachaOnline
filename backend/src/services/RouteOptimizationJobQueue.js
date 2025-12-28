const Queue = require('bull');
const db = require('../config/database');
const RouteOptimizationService = require('./RouteOptimizationService');

/**
 * RouteOptimizationJobQueue - Manages scheduled route optimization for all pending orders
 * Runs every N minutes (configurable) to auto-optimize pending orders and assign to riders
 * Can be triggered manually by riders or run automatically in the background
 */
class RouteOptimizationJobQueue {
  constructor() {
    this.queue = null;
    this.isInitialized = false;
    this.io = null; // WebSocket instance for real-time notifications
  }

  /**
   * Initialize the route optimization job queue
   * @param {Object} io - Socket.IO instance for WebSocket notifications
   * @returns {Promise<void>}
   */
  async initialize(io) {
    try {
      if (this.isInitialized) {
        console.log('[RouteOptimizationQueue] Already initialized');
        return;
      }

      this.io = io;

      // Create Bull queue connected to Redis
      this.queue = new Queue('route-optimization', {
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379
        }
      });

      // Process auto-optimization jobs
      this.queue.process('auto-optimize-routes', async (job) => {
        return await this.processAutoOptimizationJob(job);
      });

      // Event listeners
      this.queue.on('completed', (job) => {
        console.log(`[RouteOptimizationQueue] Job ${job.id} completed`);
      });

      this.queue.on('failed', (job, err) => {
        console.error(`[RouteOptimizationQueue] Job ${job.id} failed:`, err.message);
      });

      this.queue.on('error', (err) => {
        console.error('[RouteOptimizationQueue] Queue error:', err);
      });

      // Schedule recurring auto-optimization job
      await this.scheduleRecurringOptimization();

      this.isInitialized = true;
      console.log('[RouteOptimizationQueue] Initialized successfully');
    } catch (error) {
      console.error('[RouteOptimizationQueue] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Schedule recurring route optimization (every N minutes)
   * @returns {Promise<void>}
   */
  async scheduleRecurringOptimization() {
    try {
      // Get configuration from environment
      const intervalMinutes = parseInt(process.env.ROUTE_AUTO_OPTIMIZATION_INTERVAL || '5');
      const enabled = process.env.ROUTE_AUTO_OPTIMIZATION_ENABLED !== 'false';

      if (!enabled) {
        console.log('[RouteOptimizationQueue] Auto-optimization disabled via environment variable');
        return;
      }

      // Remove any existing recurring jobs
      const repeatableJobs = await this.queue.getRepeatableJobs();
      for (const job of repeatableJobs) {
        if (job.name === 'auto-optimize-routes') {
          await this.queue.removeRepeatableByKey(job.key);
        }
      }

      // Convert minutes to milliseconds for the repeat interval
      const intervalMs = intervalMinutes * 60 * 1000;

      // Schedule new job to run every N minutes
      await this.queue.add(
        'auto-optimize-routes',
        { timestamp: new Date().toISOString(), source: 'auto_generated' },
        {
          repeat: {
            every: intervalMs // Every N minutes
          },
          removeOnComplete: false,
          removeOnFail: false,
          jobId: 'recurring-auto-optimization'
        }
      );

      console.log(`[RouteOptimizationQueue] Scheduled auto-optimization every ${intervalMinutes} minute(s)`);
    } catch (error) {
      console.error('[RouteOptimizationQueue] Error scheduling recurring jobs:', error);
      throw error;
    }
  }

  /**
   * Process auto-optimization job for all pending orders
   * @param {Object} job - Bull job object
   * @returns {Promise<Object>} Job result summary
   */
  async processAutoOptimizationJob(job) {
    const jobStartTime = Date.now();

    try {
      console.log(`[RouteOptimizationQueue] Starting auto-optimization job ${job.id} at ${new Date().toISOString()}`);

      // Get all ready orders across all merchants (orders that are ready for pickup/delivery)
      const ordersResult = await db.query(
        `SELECT
          o.id, o.merchant_id, o.order_status, o.created_at,
          COALESCE(u.latitude, 0) as latitude,
          COALESCE(u.longitude, 0) as longitude
         FROM orders o
         LEFT JOIN users u ON o.student_id = u.id
         WHERE o.order_status = 'ready'
         AND o.rider_id IS NULL
         AND o.created_at > NOW() - INTERVAL '7 days'
         AND u.latitude IS NOT NULL
         AND u.longitude IS NOT NULL
         ORDER BY o.created_at ASC`
      );

      const orders = ordersResult.rows;
      console.log(`[RouteOptimizationQueue] Found ${orders.length} ready orders to optimize`);

      // Get available riders (not currently delivering)
      const ridersResult = await db.query(
        `SELECT
          u.id, u.name, 5 as capacity
         FROM users u
         WHERE u.role = 'rider'
         AND u.is_verified = true
         AND u.is_active = true
         ORDER BY u.id`
      );

      const riders = ridersResult.rows;
      console.log(`[RouteOptimizationQueue] Found ${riders.length} available riders`);

      const results = {
        job_id: job.id,
        total_pending_orders: orders.length,
        available_riders: riders.length,
        routes_generated: 0,
        orders_assigned: 0,
        optimizations: [],
        summary: {
          duration_ms: 0,
          algorithm_used: 'clarke_wright',
          success: false,
          error: null
        }
      };

      // Only process if there are orders and riders
      if (orders.length === 0) {
        console.log('[RouteOptimizationQueue] No pending orders to optimize');
        results.summary.success = true;
        results.summary.duration_ms = Date.now() - jobStartTime;
        return results;
      }

      if (riders.length === 0) {
        console.log('[RouteOptimizationQueue] No available riders');
        results.summary.success = true;
        results.summary.duration_ms = Date.now() - jobStartTime;
        return results;
      }

      // Run optimization using RouteOptimizationService
      try {
        const optimizationResult = await RouteOptimizationService.generateOptimizedRoutes({
          source: 'auto_generated',
          method: process.env.ROUTE_DEFAULT_METHOD || 'clarke_wright'
        });

        if (optimizationResult.success && optimizationResult.routes && optimizationResult.routes.length > 0) {
          results.routes_generated = optimizationResult.routes.length;
          results.orders_assigned = optimizationResult.statistics?.orders_assigned || 0;
          results.summary.algorithm_used = optimizationResult.method || 'clarke_wright';
          results.summary.success = true;

          // Build optimization record for audit trail
          results.optimizations.push({
            timestamp: new Date().toISOString(),
            routes_count: optimizationResult.routes.length,
            total_distance_m: optimizationResult.total_distance_m,
            solve_time_ms: optimizationResult.solve_time_ms,
            method: optimizationResult.method,
            orders_assigned: results.orders_assigned
          });

          console.log(
            `[RouteOptimizationQueue] Auto-optimization succeeded: ${results.routes_generated} routes, ` +
            `${results.orders_assigned} orders assigned, ${optimizationResult.solve_time_ms}ms solve time`
          );

          // Emit WebSocket event to notify connected clients (riders, admins)
          if (this.io) {
            this.io.emit('routes:auto_generated', {
              job_id: job.id,
              routes_count: results.routes_generated,
              orders_assigned: results.orders_assigned,
              algorithm: results.summary.algorithm_used,
              solve_time_ms: optimizationResult.solve_time_ms,
              total_distance_m: optimizationResult.total_distance_m,
              timestamp: new Date().toISOString()
            });

            // Also emit to specific rider namespaces if routes assigned
            if (optimizationResult.routes && Array.isArray(optimizationResult.routes)) {
              for (const route of optimizationResult.routes) {
                if (route.rider_id) {
                  this.io.to(`rider:${route.rider_id}`).emit('routes:assigned', {
                    route_id: route.id,
                    orders: route.order_ids,
                    distance_m: route.distance_m,
                    deliveries: route.num_deliveries,
                    timestamp: new Date().toISOString()
                  });
                }
              }
            }
          }
        } else {
          console.warn('[RouteOptimizationQueue] Auto-optimization produced no routes');
          results.summary.success = true; // Don't fail the job, just report empty
        }
      } catch (optimizationError) {
        console.error('[RouteOptimizationQueue] Optimization failed:', optimizationError.message);
        results.summary.error = optimizationError.message;
        results.summary.success = false;
        // Don't throw - allow job to complete even if optimization fails
      }

      results.summary.duration_ms = Date.now() - jobStartTime;

      // Store job results in database for monitoring/auditing
      try {
        await db.query(
          `INSERT INTO route_optimization_jobs
           (job_id, status, routes_generated, orders_assigned, algorithm_used, duration_ms, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (job_id) DO UPDATE SET
           status = $2, routes_generated = $3, orders_assigned = $4, algorithm_used = $5,
           duration_ms = $6, metadata = $7`,
          [
            job.id,
            results.summary.success ? 'completed' : 'failed',
            results.routes_generated,
            results.orders_assigned,
            results.summary.algorithm_used,
            results.summary.duration_ms,
            JSON.stringify(results.optimizations)
          ]
        );
      } catch (dbError) {
        // Table might not exist yet - create it if needed
        if (dbError.message.includes('does not exist')) {
          try {
            await db.query(`
              CREATE TABLE IF NOT EXISTS route_optimization_jobs (
                job_id VARCHAR(255) PRIMARY KEY,
                status VARCHAR(50),
                routes_generated INTEGER,
                orders_assigned INTEGER,
                algorithm_used VARCHAR(50),
                duration_ms INTEGER,
                metadata JSONB,
                created_at TIMESTAMP DEFAULT NOW()
              )
            `);
            console.log('[RouteOptimizationQueue] Created route_optimization_jobs table');

            // Retry insert
            await db.query(
              `INSERT INTO route_optimization_jobs
               (job_id, status, routes_generated, orders_assigned, algorithm_used, duration_ms, metadata)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                job.id,
                results.summary.success ? 'completed' : 'failed',
                results.routes_generated,
                results.orders_assigned,
                results.summary.algorithm_used,
                results.summary.duration_ms,
                JSON.stringify(results.optimizations)
              ]
            );
          } catch (retryError) {
            console.error('[RouteOptimizationQueue] Error storing job results:', retryError.message);
          }
        }
      }

      console.log(
        `[RouteOptimizationQueue] Auto-optimization job completed in ${results.summary.duration_ms}ms: ` +
        `${results.routes_generated} routes generated, ${results.orders_assigned} orders assigned`
      );

      return results;
    } catch (error) {
      console.error('[RouteOptimizationQueue] Job processing error:', error);

      // Emit error notification
      if (this.io) {
        this.io.emit('routes:optimization_error', {
          job_id: job.id,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }

      // Return partial results on error
      return {
        job_id: job.id,
        success: false,
        error: error.message,
        duration_ms: Date.now() - jobStartTime
      };
    }
  }

  /**
   * Manually trigger auto-optimization
   * @returns {Promise<Object>} Job object
   */
  async triggerAutoOptimization() {
    try {
      if (!this.queue) {
        throw new Error('Queue not initialized');
      }

      const job = await this.queue.add(
        'auto-optimize-routes',
        { timestamp: new Date().toISOString(), manual_trigger: true },
        {
          priority: 1, // High priority for manual triggers
          removeOnComplete: false,
          removeOnFail: false
        }
      );

      console.log(`[RouteOptimizationQueue] Manually triggered auto-optimization, job ID: ${job.id}`);
      return job;
    } catch (error) {
      console.error('[RouteOptimizationQueue] Error triggering auto-optimization:', error);
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
      console.error('[RouteOptimizationQueue] Error getting job status:', error);
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
      console.error('[RouteOptimizationQueue] Error getting queue stats:', error);
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
        console.log('[RouteOptimizationQueue] Queue closed');
      }
    } catch (error) {
      console.error('[RouteOptimizationQueue] Error closing queue:', error);
    }
  }
}

module.exports = new RouteOptimizationJobQueue();
