const express = require('express');
const SalesPredictionService = require('../services/SalesPredictionService');
const EventCalendarService = require('../services/EventCalendarService');
const ForecastJobQueue = require('../services/ForecastJobQueue');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/merchant/predictions/weekly
 * @desc    Get weekly sales forecast for merchant
 * @access  Private (Merchants only)
 */
router.get('/merchant/predictions/weekly', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const forecast = await SalesPredictionService.getWeeklyForecast(req.user.id);

    res.json({
      message: 'Weekly forecast retrieved successfully',
      data: forecast
    });
  } catch (error) {
    console.error('Get weekly forecast error:', error);
    res.status(500).json({
      error: 'Failed to fetch weekly forecast',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/merchant/predictions/weekly/location
 * @desc    Get weekly sales forecast with location-based insights
 * @desc    Provides geographic breakdown of predicted sales and demand patterns
 * @access  Private (Merchants only)
 */
router.get('/merchant/predictions/weekly/location', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const forecast = await SalesPredictionService.getWeeklyForecastWithLocation(req.user.id);

    res.json({
      message: 'Weekly forecast with location insights retrieved successfully',
      data: forecast
    });
  } catch (error) {
    console.error('Get weekly location forecast error:', error);
    res.status(500).json({
      error: 'Failed to fetch weekly location forecast',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/merchant/predictions/products
 * @desc    Get product-level predictions for next 7 days
 * @access  Private (Merchants only)
 */
router.get('/merchant/predictions/products', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const topProducts = await SalesPredictionService.getTopSellingProducts(req.user.id, parseInt(limit));

    res.json({
      message: 'Product predictions retrieved successfully',
      count: topProducts.length,
      data: topProducts
    });
  } catch (error) {
    console.error('Get product predictions error:', error);
    res.status(500).json({
      error: 'Failed to fetch product predictions',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/merchant/predictions/inventory-alerts
 * @desc    Get inventory depletion warnings and alerts
 * @access  Private (Merchants only)
 */
router.get('/merchant/predictions/inventory-alerts', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const alerts = await SalesPredictionService.getInventoryAlerts(req.user.id);

    res.json({
      message: 'Inventory alerts retrieved successfully',
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Get inventory alerts error:', error);
    res.status(500).json({
      error: 'Failed to fetch inventory alerts',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/merchant/predictions/accuracy
 * @desc    Get forecast accuracy metrics
 * @access  Private (Merchants only)
 */
router.get('/merchant/predictions/accuracy', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const { days_back = 7 } = req.query;
    const metrics = await SalesPredictionService.getForecastAccuracy(req.user.id, parseInt(days_back));

    res.json({
      message: 'Accuracy metrics retrieved successfully',
      data: metrics
    });
  } catch (error) {
    console.error('Get accuracy metrics error:', error);
    res.status(500).json({
      error: 'Failed to fetch accuracy metrics',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/merchant/predictions/events
 * @desc    Get upcoming holidays and events
 * @access  Private (Merchants only)
 */
router.get('/merchant/predictions/events', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const { days_ahead = 30 } = req.query;
    const events = await EventCalendarService.getUpcomingEvents(parseInt(days_ahead));
    const majorEvents = await EventCalendarService.getMajorEventsContext();

    res.json({
      message: 'Events retrieved successfully',
      upcoming_events: events,
      major_events_context: majorEvents
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      error: 'Failed to fetch events',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/merchant/predictions/custom-event
 * @desc    Add a custom event for merchant's business
 * @access  Private (Merchants only)
 */
router.post('/merchant/predictions/custom-event', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const { event_name, event_date, impact_factor, applies_to_categories } = req.body;

    if (!event_name || !event_date) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'event_name and event_date are required'
      });
    }

    const result = await EventCalendarService.addMerchantEvent(req.user.id, {
      event_name,
      event_date,
      impact_factor: impact_factor || 1.0,
      applies_to_categories: applies_to_categories || []
    });

    res.status(201).json({
      message: 'Custom event added successfully',
      data: result
    });
  } catch (error) {
    console.error('Add custom event error:', error);
    res.status(500).json({
      error: 'Failed to add custom event',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/merchant/predictions/refresh
 * @desc    Manually trigger forecast generation for merchant
 * @access  Private (Merchants only)
 */
router.post('/merchant/predictions/refresh', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const result = await SalesPredictionService.refreshForecasts(req.user.id);

    res.json({
      message: 'Forecasts refreshed successfully',
      data: result
    });
  } catch (error) {
    console.error('Refresh forecasts error:', error);
    res.status(500).json({
      error: 'Failed to refresh forecasts',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/admin/predictions/events
 * @desc    Get all system events (admin only)
 * @access  Private (Admin only)
 */
router.get('/admin/predictions/events', authenticate, authorize('admin'), async (req, res) => {
  try {
    const events = await EventCalendarService.getUpcomingEvents(90);

    res.json({
      message: 'System events retrieved successfully',
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Get system events error:', error);
    res.status(500).json({
      error: 'Failed to fetch system events',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/admin/predictions/refresh-all
 * @desc    Manually trigger forecast generation for all merchants
 * @access  Private (Admin only)
 */
router.post('/admin/predictions/refresh-all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const job = await ForecastJobQueue.triggerAllMerchantForecasts();

    res.status(202).json({
      message: 'Forecast refresh triggered for all merchants',
      job_id: job.id,
      job_name: job.name,
      status: 'queued',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Refresh all forecasts error:', error);
    res.status(500).json({
      error: 'Failed to trigger forecast refresh',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/admin/predictions/refresh-merchant/:merchantId
 * @desc    Manually trigger forecast generation for a specific merchant
 * @access  Private (Admin only)
 */
router.post('/admin/predictions/refresh-merchant/:merchantId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { merchantId } = req.params;
    const job = await ForecastJobQueue.triggerMerchantForecast(parseInt(merchantId));

    res.status(202).json({
      message: `Forecast refresh triggered for merchant ${merchantId}`,
      job_id: job.id,
      merchant_id: merchantId,
      status: 'queued',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Refresh merchant forecast error:', error);
    res.status(500).json({
      error: 'Failed to trigger merchant forecast refresh',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/admin/predictions/queue/stats
 * @desc    Get forecast job queue statistics
 * @access  Private (Admin only)
 */
router.get('/admin/predictions/queue/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const stats = await ForecastJobQueue.getQueueStats();

    res.json({
      message: 'Queue statistics retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get queue stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch queue statistics',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/admin/predictions/queue/job/:jobId
 * @desc    Get status of a specific forecast job
 * @access  Private (Admin only)
 */
router.get('/admin/predictions/queue/job/:jobId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobStatus = await ForecastJobQueue.getJobStatus(jobId);

    res.json({
      message: 'Job status retrieved successfully',
      data: jobStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get job status error:', error);
    res.status(500).json({
      error: 'Failed to fetch job status',
      message: error.message
    });
  }
});

// ============================================================
// FOUR-LAYER ENSEMBLE FORECASTING ENDPOINTS
// ============================================================

/**
 * @route   GET /api/v1/merchant/predictions/ensemble
 * @desc    Get four-layer ensemble forecast for merchant
 * @desc    Returns final ensemble predictions with all layer weights
 * @access  Private (Merchants only)
 */
router.get('/merchant/predictions/ensemble', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const forecast = await SalesPredictionService.getWeeklyForecast(req.user.id);

    res.json({
      message: 'Ensemble forecast retrieved successfully',
      data: {
        forecast_type: 'four_layer_ensemble',
        merchant_id: req.user.id,
        ...forecast
      }
    });
  } catch (error) {
    console.error('Get ensemble forecast error:', error);
    res.status(500).json({
      error: 'Failed to fetch ensemble forecast',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/merchant/predictions/ensemble/detailed
 * @desc    Get all four layers with detailed breakdown
 * @desc    Shows predictions from Layer 1, 2, 3, and 4 for comparison
 * @query   ?product_id=1 (optional) - specific product forecast
 * @access  Private (Merchants only)
 */
router.get('/merchant/predictions/ensemble/detailed', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const { product_id } = req.query;
    const db = require('../config/database');

    // Get ensemble metadata for detailed layer information
    const result = await db.query(
      `SELECT
        em.layers_succeeded,
        em.layer2_model_stats,
        em.layer2_feature_importance,
        em.layer3_rule_statistics,
        em.layer4_weights,
        em.layer4_confidence,
        em.layer4_performance_metrics,
        em.forecast_horizon,
        l1.predicted_quantity as layer1_yhat,
        l2.corrected_yhat as layer2_yhat,
        l3.final_yhat as layer3_yhat,
        l4.final_yhat as layer4_yhat,
        sp.predicted_quantity as final_yhat,
        sp.prediction_date
      FROM sales_predictions sp
      LEFT JOIN layer2_predictions l2 ON sp.merchant_id = l2.merchant_id
        AND sp.product_id = l2.product_id
        AND sp.prediction_date = l2.prediction_date
      LEFT JOIN layer3_predictions l3 ON sp.merchant_id = l3.merchant_id
        AND sp.product_id = l3.product_id
        AND sp.prediction_date = l3.prediction_date
      LEFT JOIN layer4_predictions l4 ON sp.merchant_id = l4.merchant_id
        AND sp.product_id = l4.product_id
        AND sp.prediction_date = l4.prediction_date
      LEFT JOIN ensemble_forecast_metadata em ON sp.merchant_id = em.merchant_id
      WHERE sp.merchant_id = $1
        AND sp.prediction_date >= CURRENT_DATE
        AND sp.prediction_date <= CURRENT_DATE + INTERVAL '14 days'
      ${product_id ? 'AND sp.product_id = $2' : ''}
      ORDER BY sp.prediction_date ASC`,
      product_id ? [req.user.id, product_id] : [req.user.id]
    );

    const predictions = result.rows.map(row => ({
      prediction_date: row.prediction_date,
      layers: {
        layer1_prophet: row.layer1_yhat,
        layer2_xgboost: row.layer2_yhat,
        layer3_context: row.layer3_yhat,
        layer4_ensemble: row.layer4_yhat
      },
      final_prediction: row.final_yhat,
      metadata: result.rows[0] ? {
        layers_succeeded: result.rows[0].layers_succeeded,
        layer2_stats: result.rows[0].layer2_model_stats,
        layer3_rules: result.rows[0].layer3_rule_statistics,
        layer4_weights: result.rows[0].layer4_weights,
        layer4_confidence: result.rows[0].layer4_confidence,
        performance_metrics: result.rows[0].layer4_performance_metrics
      } : null
    }));

    res.json({
      message: 'Detailed ensemble forecast retrieved successfully',
      data: {
        merchant_id: req.user.id,
        product_id: product_id || 'all',
        forecast_type: 'four_layer_ensemble_detailed',
        predictions: predictions
      }
    });
  } catch (error) {
    console.error('Get detailed ensemble forecast error:', error);
    res.status(500).json({
      error: 'Failed to fetch detailed ensemble forecast',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/merchant/predictions/ensemble/refresh
 * @desc    Manually trigger four-layer ensemble generation for merchant
 * @access  Private (Merchants only)
 */
router.post('/merchant/predictions/ensemble/refresh', authenticate, authorize('merchant'), async (req, res) => {
  try {
    const result = await SalesPredictionService.generateProductForecasts(req.user.id);

    res.status(202).json({
      message: 'Ensemble forecast generation triggered successfully',
      data: {
        merchant_id: req.user.id,
        forecast_type: 'four_layer_ensemble',
        status: 'processing',
        result: result.summary
      }
    });
  } catch (error) {
    console.error('Trigger ensemble refresh error:', error);
    res.status(500).json({
      error: 'Failed to trigger ensemble forecast generation',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/admin/predictions/ensemble/all
 * @desc    Get four-layer ensemble forecasts for all merchants (summary)
 * @query   ?limit=10&offset=0 - pagination
 * @query   ?sort=confidence - sort by confidence score
 * @access  Private (Admin only)
 */
router.get('/admin/predictions/ensemble/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { limit = 10, offset = 0, sort = 'confidence' } = req.query;
    const db = require('../config/database');

    const result = await db.query(
      `SELECT
        em.merchant_id,
        u.name as merchant_name,
        MAX(em.forecast_date) as latest_forecast,
        em.forecast_horizon,
        em.layer4_confidence,
        em.layer4_performance_metrics,
        COUNT(DISTINCT em.product_id) as products_forecasted
      FROM ensemble_forecast_metadata em
      JOIN users u ON em.merchant_id = u.id
      WHERE u.role = 'merchant'
      GROUP BY em.merchant_id, u.name, em.forecast_horizon, em.layer4_confidence, em.layer4_performance_metrics
      ORDER BY
        ${sort === 'confidence' ? 'em.layer4_confidence DESC' : 'em.forecast_date DESC'}
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      message: 'Ensemble forecasts for all merchants retrieved successfully',
      data: {
        total: result.rows.length,
        limit,
        offset,
        forecasts: result.rows
      }
    });
  } catch (error) {
    console.error('Get all ensemble forecasts error:', error);
    res.status(500).json({
      error: 'Failed to fetch ensemble forecasts',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/admin/predictions/ensemble/merchant/:merchantId
 * @desc    Get four-layer ensemble forecast for specific merchant (admin view)
 * @access  Private (Admin only)
 */
router.get('/admin/predictions/ensemble/merchant/:merchantId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { merchantId } = req.params;
    const forecast = await SalesPredictionService.getWeeklyForecast(parseInt(merchantId));

    res.json({
      message: 'Ensemble forecast retrieved successfully',
      data: {
        merchant_id: merchantId,
        forecast_type: 'four_layer_ensemble',
        ...forecast
      }
    });
  } catch (error) {
    console.error('Get merchant ensemble forecast error:', error);
    res.status(500).json({
      error: 'Failed to fetch merchant ensemble forecast',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/v1/admin/predictions/ensemble/refresh-merchant/:merchantId
 * @desc    Trigger four-layer ensemble generation for specific merchant (admin)
 * @access  Private (Admin only)
 */
router.post('/admin/predictions/ensemble/refresh-merchant/:merchantId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { merchantId } = req.params;
    const result = await SalesPredictionService.generateProductForecasts(parseInt(merchantId));

    res.status(202).json({
      message: 'Ensemble forecast generation triggered for merchant',
      data: {
        merchant_id: merchantId,
        forecast_type: 'four_layer_ensemble',
        status: 'processing',
        result: result.summary
      }
    });
  } catch (error) {
    console.error('Trigger merchant ensemble refresh error:', error);
    res.status(500).json({
      error: 'Failed to trigger merchant ensemble forecast generation',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/v1/admin/predictions/ensemble/stats
 * @desc    Get ensemble forecasting system performance statistics
 * @access  Private (Admin only)
 */
router.get('/admin/predictions/ensemble/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const db = require('../config/database');

    // Get overall ensemble statistics
    const stats = await db.query(`
      SELECT
        COUNT(DISTINCT merchant_id) as merchants_with_forecasts,
        COUNT(DISTINCT product_id) as products_forecasted,
        AVG(layer4_confidence) as avg_ensemble_confidence,
        AVG((layer4_performance_metrics->>'mape')::NUMERIC) as avg_mape,
        MIN((layer4_performance_metrics->>'mape')::NUMERIC) as min_mape,
        MAX((layer4_performance_metrics->>'mape')::NUMERIC) as max_mape,
        COUNT(CASE WHEN layers_succeeded::text = '{"layer1":true,"layer2":true,"layer3":true,"layer4":true}' THEN 1 END) as all_layers_succeeded_count,
        COUNT(*) as total_forecasts
      FROM ensemble_forecast_metadata
      WHERE forecast_date >= CURRENT_DATE - INTERVAL '7 days'
    `);

    res.json({
      message: 'Ensemble statistics retrieved successfully',
      data: {
        period: 'last_7_days',
        ...stats.rows[0]
      }
    });
  } catch (error) {
    console.error('Get ensemble stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch ensemble statistics',
      message: error.message
    });
  }
});

module.exports = router;
