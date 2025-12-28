const db = require('../config/database');
let redis = null;
try {
  redis = require('../config/redis');
} catch (err) {
  console.warn('⚠️  Redis not available, caching disabled:', err.message);
}
const PredictionScriptsService = require('./PredictionScriptsService');
const FeaturesService = require('./FeaturesService');
const EventCalendarService = require('./EventCalendarService');

class SalesPredictionService {
  /**
   * Get historical sales data for a product
   * @param {Number} productId - Product ID
   * @param {Number} daysBack - Number of days to fetch (default: 180)
   * @returns {Promise<Array>} - Array of {date, quantity} objects
   */
  async getProductSalesHistory(productId, daysBack = 180) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const result = await db.query(
        `SELECT
          DATE(o.created_at) as date,
          COALESCE(SUM(oi.quantity), 0) as quantity,
          COALESCE(SUM(oi.quantity * oi.unit_price), 0) as revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.product_id = $1
          AND o.order_status = 'delivered'
          AND o.created_at >= $2
        GROUP BY DATE(o.created_at)
        ORDER BY date ASC`,
        [productId, startDate]
      );

      return result.rows.map(row => ({
        date: row.date.toISOString().split('T')[0],
        quantity: parseInt(row.quantity, 10),
        revenue: parseFloat(row.revenue)
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get location-based sales history for a product
   * Enhances prediction by incorporating geographic demand patterns
   * @param {Number} productId - Product ID
   * @param {Number} merchantId - Merchant ID
   * @param {Number} daysBack - Number of days to fetch
   * @returns {Promise<Object>} - Location-based sales data with patterns
   */
  async getLocationBasedSalesHistory(productId, merchantId, daysBack = 180) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Get sales data grouped by delivery location with geographic clustering
      const result = await db.query(
        `SELECT
          DATE(o.created_at) as date,
          u.latitude,
          u.longitude,
          COALESCE(SUM(oi.quantity), 0) as quantity,
          COALESCE(SUM(oi.quantity * oi.unit_price), 0) as revenue,
          COUNT(DISTINCT o.id) as order_count,
          -- Calculate distance from merchant location
          SQRT(
            POW(COALESCE(u.latitude, 0) - COALESCE(m.latitude, 0), 2) +
            POW(COALESCE(u.longitude, 0) - COALESCE(m.longitude, 0), 2)
          ) * 111 as distance_km
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN users u ON o.customer_id = u.id
        JOIN users m ON m.id = $2
        WHERE oi.product_id = $1
          AND o.order_status = 'delivered'
          AND o.created_at >= $3
        GROUP BY DATE(o.created_at), u.latitude, u.longitude
        ORDER BY date ASC`,
        [productId, merchantId, startDate]
      );

      // Organize data by location zones and calculate patterns
      const locationZones = {};
      const dailyTotals = {};

      for (const row of result.rows) {
        const date = row.date.toISOString().split('T')[0];
        const distance = parseFloat(row.distance_km) || 0;

        // Categorize locations into zones: near (0-2km), medium (2-5km), far (5+km)
        const zone = distance <= 2 ? 'near' : (distance <= 5 ? 'medium' : 'far');

        if (!locationZones[zone]) {
          locationZones[zone] = {
            total_quantity: 0,
            total_revenue: 0,
            order_count: 0,
            days_active: new Set()
          };
        }

        locationZones[zone].total_quantity += parseInt(row.quantity, 10);
        locationZones[zone].total_revenue += parseFloat(row.revenue);
        locationZones[zone].order_count += row.order_count;
        locationZones[zone].days_active.add(date);

        // Track daily totals
        if (!dailyTotals[date]) {
          dailyTotals[date] = 0;
        }
        dailyTotals[date] += parseInt(row.quantity, 10);
      }

      // Convert Sets to arrays for serialization
      const zoneSummary = {};
      for (const [zone, data] of Object.entries(locationZones)) {
        zoneSummary[zone] = {
          total_quantity: data.total_quantity,
          total_revenue: data.total_revenue,
          order_count: data.order_count,
          active_days: data.days_active.size,
          avg_daily: Math.round(data.total_quantity / (data.days_active.size || 1)),
          percentage: 0 // Will be calculated below
        };
      }

      // Calculate percentages
      const totalQuantity = Object.values(zoneSummary).reduce((sum, z) => sum + z.total_quantity, 0);
      for (const zone of Object.keys(zoneSummary)) {
        zoneSummary[zone].percentage = totalQuantity > 0 ?
          Math.round((zoneSummary[zone].total_quantity / totalQuantity) * 100) : 0;
      }

      return {
        location_zones: zoneSummary,
        daily_totals: dailyTotals,
        location_diversity: Object.keys(locationZones).length,
        peak_zone: Object.entries(zoneSummary).reduce((max, [zone, data]) =>
          data.total_quantity > (max[1]?.total_quantity || 0) ? [zone, data] : max, [null, {}])[0]
      };
    } catch (error) {
      console.error('Error getting location-based sales history:', error);
      return null;
    }
  }

  /**
   * Generate product-level forecasts for a merchant
   * @param {Number} merchantId - Merchant ID
   * @returns {Promise<Object>} - Forecasts for all products
   */
  async generateProductForecasts(merchantId) {
    try {
      // Get merchant details for feature generation
      const merchantResult = await db.query(
        `SELECT p.category, p.price, z.name as zone_name
         FROM products p
         LEFT JOIN zones z ON p.zone_id = z.id
         WHERE p.merchant_id = $1 AND p.is_active = true
         LIMIT 1`,
        [merchantId]
      );

      const merchantData = merchantResult.rows[0] || {};
      const category = merchantData.category;
      const hostelZone = merchantData.zone_name || 'center'; // Default to center zone
      const basePrice = merchantData.price;

      // Get all active products for the merchant
      const productsResult = await db.query(
        `SELECT id, name, stock_quantity FROM products
         WHERE merchant_id = $1 AND is_active = true`,
        [merchantId]
      );

      const products = productsResult.rows;
      if (products.length === 0) {
        return { successful: [], failed: [], summary: { total: 0, successful_count: 0, failed_count: 0 } };
      }

      // Generate external regressors for the forecast period
      let globalRegressors = null;
      try {
        globalRegressors = await FeaturesService.generateForecastFeatures(
          merchantId,
          category, // Product category (string like "snacks", "beverages", etc.)
          hostelZone, // Zone name from database
          basePrice, // Product price
          14 // 14-day forecast
        );
        console.log(`[SalesPrediction] Generated features for merchant ${merchantId}`);
      } catch (featureError) {
        console.warn(`[SalesPrediction] Feature generation failed, continuing without regressors:`, featureError.message);
        // Continue without features - system is backward compatible
      }

      // Prepare data for each product
      const productsData = [];
      for (const product of products) {
        const salesHistory = await this.getProductSalesHistory(product.id);

        // Only forecast products with enough historical data
        if (salesHistory.length >= 60) {
          // Get relevant events
          const events = await EventCalendarService.getRelevantEvents();

          productsData.push({
            product_id: product.id,
            product_name: product.name,
            current_stock: product.stock_quantity || 0,
            sales_data: salesHistory,
            events: events,
            regressors: globalRegressors // Add external regressors
          });
        }
      }

      // Run forecasts in parallel batches with features
      const forecastResults = await PredictionScriptsService.runBulkForecasts(merchantId, productsData, 3);

      // Store forecasts in database
      await this.storeForecastsInDatabase(merchantId, forecastResults);

      // Cache the results if Redis is available
      if (redis) {
        const cacheKey = `forecasts:${merchantId}`;
        try {
          await redis.setex(cacheKey, 86400, JSON.stringify(forecastResults)); // 24-hour cache
        } catch (cacheErr) {
          console.warn('⚠️  Failed to cache forecasts:', cacheErr.message);
        }
      }

      return forecastResults;
    } catch (error) {
      console.error('Error generating product forecasts:', error);
      throw error;
    }
  }

  /**
   * Store forecast results in database
   * @param {Number} merchantId
   * @param {Object} forecastResults
   */
  async storeForecastsInDatabase(merchantId, forecastResults) {
    try {
      console.log(`[StoreForecast] Starting storage for merchant ${merchantId}`);
      console.log(`[StoreForecast] Successful forecasts: ${forecastResults.successful.length}`);
      console.log(`[StoreForecast] Failed forecasts: ${forecastResults.failed.length}`);

      if (forecastResults.successful.length === 0) {
        console.warn(`[StoreForecast] No successful forecasts to store`);
        return;
      }

      const client = await db.getClient();

      try {
        await client.query('BEGIN');

        let totalInserted = 0;

        for (const forecast of forecastResults.successful) {
          const forecastData = forecast.forecast || [];

          if (!forecastData || forecastData.length === 0) {
            console.warn(`[StoreForecast] Product ${forecast.product_id} has empty forecast data`);
            continue;
          }

          console.log(`[StoreForecast] Storing ${forecastData.length} predictions for product ${forecast.product_id}`);

          // Insert each forecast date
          for (const prediction of forecastData) {
            await client.query(
              `INSERT INTO sales_predictions
               (merchant_id, product_id, prediction_date, predicted_quantity, trend)
               VALUES ($1, $2, $3, $4, $5)
               ON CONFLICT (merchant_id, product_id, prediction_date) DO UPDATE
               SET predicted_quantity = EXCLUDED.predicted_quantity,
                   trend = EXCLUDED.trend,
                   updated_at = CURRENT_TIMESTAMP`,
              [
                merchantId,
                forecast.product_id,
                prediction.ds,
                parseFloat(prediction.yhat),
                forecast.trend
              ]
            );
            totalInserted++;
          }
        }

        await client.query('COMMIT');
        console.log(`[StoreForecast] ✅ Successfully stored ${totalInserted} predictions for merchant ${merchantId}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`[StoreForecast] ❌ Transaction failed, rolling back:`, error.message);
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`[StoreForecast] ❌ Error storing forecasts in database:`, error.message);
      console.error(`[StoreForecast] Stack:`, error.stack);
      // Don't throw - forecasts can still be retrieved from memory
    }
  }

  /**
   * Get inventory alerts - products running out of stock
   * @param {Number} merchantId
   * @returns {Promise<Array>} - Products with low/depleting inventory
   */
  async getInventoryAlerts(merchantId) {
    try {
      // Get current stock levels and next 7 days of predictions
      const result = await db.query(
        `SELECT
          p.id,
          p.name,
          p.stock_quantity as current_stock,
          sp.predicted_quantity,
          sp.prediction_date,
          ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY sp.prediction_date) as day_num
        FROM products p
        LEFT JOIN sales_predictions sp ON p.id = sp.product_id
          AND sp.merchant_id = $1
          AND sp.prediction_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
        WHERE p.merchant_id = $1 AND p.is_active = true
        ORDER BY p.id, sp.prediction_date`,
        [merchantId]
      );

      // Process results to calculate depletion timeline
      const alerts = [];
      const productMap = {};

      for (const row of result.rows) {
        if (!productMap[row.id]) {
          productMap[row.id] = {
            product_id: row.id,
            product_name: row.name,
            current_stock: row.current_stock || 0,
            daily_predictions: [],
            alerts: []
          };
        }

        if (row.prediction_date) {
          productMap[row.id].daily_predictions.push({
            date: row.prediction_date,
            predicted_quantity: parseInt(row.predicted_quantity, 10),
            day_num: row.day_num
          });
        }
      }

      // Calculate depletion timelines
      for (const productId in productMap) {
        const product = productMap[productId];

        // Calculate cumulative depletion
        let cumulativeSales = 0;
        for (const prediction of product.daily_predictions) {
          cumulativeSales += prediction.predicted_quantity;
          const remainingStock = product.current_stock - cumulativeSales;

          // Alert if stock will deplete within 7 days
          if (remainingStock < 0 && product.alerts.length === 0) {
            product.alerts.push({
              type: 'depletion_warning',
              days_until_stockout: prediction.day_num,
              depletion_date: prediction.date,
              recommendation: `Restock ${product.product_name} within ${prediction.day_num} days`
            });
          }

          // Alert if stock is low
          if (remainingStock < product.current_stock * 0.25 && product.alerts.length === 0) {
            product.alerts.push({
              type: 'low_stock_warning',
              remaining_stock: Math.max(0, remainingStock),
              recommendation: `Consider restocking ${product.product_name} - 25% of current stock remaining`
            });
          }
        }

        if (product.alerts.length > 0) {
          delete product.daily_predictions;
          alerts.push(product);
        }
      }

      return alerts;
    } catch (error) {
      console.error('Error getting inventory alerts:', error);
      throw error;
    }
  }

  /**
   * Get top selling products for the coming week
   * @param {Number} merchantId
   * @param {Number} topN - Number of top products to return (default: 5)
   * @returns {Promise<Array>} - Top products by predicted sales
   */
  async getTopSellingProducts(merchantId, topN = 5) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const result = await db.query(
        `SELECT
          p.id,
          p.name,
          p.price,
          p.category,
          SUM(sp.predicted_quantity) as total_predicted_quantity,
          SUM(sp.predicted_quantity * p.price) as total_predicted_revenue,
          AVG(sp.predicted_quantity) as avg_daily_quantity,
          p.avg_rating,
          p.review_count
        FROM products p
        LEFT JOIN sales_predictions sp ON p.id = sp.product_id
          AND sp.merchant_id = $1
          AND sp.prediction_date BETWEEN CURRENT_DATE AND $2
        WHERE p.merchant_id = $1 AND p.is_active = true
        GROUP BY p.id, p.name, p.price, p.category, p.avg_rating, p.review_count
        ORDER BY total_predicted_quantity DESC NULLS LAST
        LIMIT $3`,
        [merchantId, endDate, topN]
      );

      return result.rows.map(row => ({
        product_id: row.id,
        product_name: row.name,
        category: row.category,
        price: parseFloat(row.price),
        predicted_weekly_quantity: parseInt(row.total_predicted_quantity || 0, 10),
        predicted_weekly_revenue: parseFloat(row.total_predicted_revenue || 0),
        avg_daily_quantity: Math.round(parseFloat(row.avg_daily_quantity || 0)),
        rating: parseFloat(row.avg_rating || 0),
        review_count: row.review_count || 0
      }));
    } catch (error) {
      console.error('Error getting top selling products:', error);
      throw error;
    }
  }

  /**
   * Get weekly sales forecast for the merchant
   * @param {Number} merchantId
   * @returns {Promise<Object>} - Weekly forecast summary
   */
  async getWeeklyForecast(merchantId) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const result = await db.query(
        `SELECT
          DATE(sp.prediction_date) as prediction_date,
          SUM(sp.predicted_quantity) as daily_quantity,
          SUM(sp.predicted_quantity * p.price) as daily_revenue
        FROM sales_predictions sp
        JOIN products p ON sp.product_id = p.id
        WHERE sp.merchant_id = $1
          AND sp.prediction_date BETWEEN CURRENT_DATE AND $2
        GROUP BY DATE(sp.prediction_date)
        ORDER BY prediction_date`,
        [merchantId, endDate]
      );

      const dailyForecasts = result.rows.map(row => ({
        date: row.prediction_date,
        predicted_quantity: parseInt(row.daily_quantity || 0, 10),
        predicted_revenue: parseFloat(row.daily_revenue || 0)
      }));

      // Calculate weekly totals
      const weeklyQuantity = dailyForecasts.reduce((sum, day) => sum + day.predicted_quantity, 0);
      const weeklyRevenue = dailyForecasts.reduce((sum, day) => sum + day.predicted_revenue, 0);

      return {
        week_start: new Date().toISOString().split('T')[0],
        week_end: endDate.toISOString().split('T')[0],
        daily_forecasts: dailyForecasts,
        summary: {
          total_predicted_quantity: weeklyQuantity,
          total_predicted_revenue: Math.round(weeklyRevenue * 100) / 100,
          avg_daily_quantity: Math.round(weeklyQuantity / 7),
          avg_daily_revenue: Math.round(weeklyRevenue / 7 * 100) / 100
        }
      };
    } catch (error) {
      console.error('Error getting weekly forecast:', error);
      throw error;
    }
  }

  /**
   * Get forecast accuracy metrics for a merchant
   * @param {Number} merchantId
   * @param {Number} daysBack - Evaluate predictions from N days ago
   * @returns {Promise<Object>} - Accuracy metrics and MAPE
   */
  async getForecastAccuracy(merchantId, daysBack = 7) {
    try {
      const evaluationDate = new Date();
      evaluationDate.setDate(evaluationDate.getDate() - daysBack);

      const result = await db.query(
        `SELECT
          COUNT(*) as total_predictions,
          AVG(ABS(fm.prediction_error_percent)) as mean_absolute_error,
          AVG(fm.mape) as mean_absolute_percentage_error,
          MAX(fm.mape) as max_error,
          MIN(fm.mape) as min_error
        FROM forecast_metrics fm
        WHERE fm.merchant_id = $1
          AND fm.evaluation_date >= $2`,
        [merchantId, evaluationDate]
      );

      const metrics = result.rows[0] || {
        total_predictions: 0,
        mean_absolute_error: 0,
        mean_absolute_percentage_error: 0
      };

      return {
        evaluation_period: `${daysBack} days`,
        total_predictions_evaluated: metrics.total_predictions,
        mean_absolute_error: Math.round(parseFloat(metrics.mean_absolute_error || 0) * 100) / 100,
        mean_absolute_percentage_error: Math.round(parseFloat(metrics.mean_absolute_percentage_error || 0) * 100) / 100,
        max_error: Math.round(parseFloat(metrics.max_error || 0) * 100) / 100,
        min_error: Math.round(parseFloat(metrics.min_error || 0) * 100) / 100,
        accuracy_score: metrics.total_predictions > 0 ?
          Math.max(0, 100 - (parseFloat(metrics.mean_absolute_percentage_error) || 0)) : 0
      };
    } catch (error) {
      console.error('Error getting forecast accuracy:', error);
      throw error;
    }
  }

  /**
   * Get weekly forecast with location-based breakdown
   * Enhanced forecasting that incorporates geographic demand patterns
   * @param {Number} merchantId - Merchant ID
   * @returns {Promise<Object>} - Weekly forecast with location insights
   */
  async getWeeklyForecastWithLocation(merchantId) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 180);

      // Get location-based forecast from sales prediction data
      const locationResult = await db.query(
        `SELECT
          CASE
            WHEN SQRT(
              POW(COALESCE(u.latitude, 0) - COALESCE(m.latitude, 0), 2) +
              POW(COALESCE(u.longitude, 0) - COALESCE(m.longitude, 0), 2)
            ) * 111 <= 2 THEN 'near'
            WHEN SQRT(
              POW(COALESCE(u.latitude, 0) - COALESCE(m.latitude, 0), 2) +
              POW(COALESCE(u.longitude, 0) - COALESCE(m.longitude, 0), 2)
            ) * 111 <= 5 THEN 'medium'
            ELSE 'far'
          END as delivery_zone,
          COUNT(DISTINCT o.id) as order_count,
          COALESCE(SUM(oi.quantity), 0) as total_quantity,
          COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN users u ON o.customer_id = u.id
        JOIN users m ON m.id = $1
        WHERE m.id = $1
          AND o.order_status = 'delivered'
          AND o.created_at >= $2
        GROUP BY delivery_zone`,
        [merchantId, startDate]
      );

      const locationBreakdown = {};
      let totalHistoricalQuantity = 0;

      for (const row of locationResult.rows) {
        locationBreakdown[row.delivery_zone] = {
          order_count: row.order_count,
          total_quantity: parseInt(row.total_quantity, 10),
          total_revenue: parseFloat(row.total_revenue),
          percentage: 0 // Will be calculated below
        };
        totalHistoricalQuantity += parseInt(row.total_quantity, 10);
      }

      // Calculate location percentages
      for (const zone of Object.keys(locationBreakdown)) {
        locationBreakdown[zone].percentage = totalHistoricalQuantity > 0 ?
          Math.round((locationBreakdown[zone].total_quantity / totalHistoricalQuantity) * 100) : 0;
      }

      // Get weekly forecast data
      const forecastResult = await db.query(
        `SELECT
          DATE(sp.prediction_date) as prediction_date,
          SUM(sp.predicted_quantity) as daily_quantity,
          SUM(sp.predicted_quantity * p.price) as daily_revenue
        FROM sales_predictions sp
        JOIN products p ON sp.product_id = p.id
        WHERE sp.merchant_id = $1
          AND sp.prediction_date BETWEEN CURRENT_DATE AND $2
        GROUP BY DATE(sp.prediction_date)
        ORDER BY prediction_date`,
        [merchantId, endDate]
      );

      const dailyForecasts = forecastResult.rows.map(row => ({
        date: row.prediction_date,
        predicted_quantity: parseInt(row.daily_quantity || 0, 10),
        predicted_revenue: parseFloat(row.daily_revenue || 0),
        // Apply location-based distribution
        location_distribution: {}
      }));

      // Distribute forecast by location zones
      for (const day of dailyForecasts) {
        for (const [zone, data] of Object.entries(locationBreakdown)) {
          const percentage = data.percentage / 100;
          day.location_distribution[zone] = {
            predicted_quantity: Math.round(day.predicted_quantity * percentage),
            predicted_revenue: Math.round(day.predicted_revenue * percentage * 100) / 100
          };
        }
      }

      // Calculate weekly totals
      const weeklyQuantity = dailyForecasts.reduce((sum, day) => sum + day.predicted_quantity, 0);
      const weeklyRevenue = dailyForecasts.reduce((sum, day) => sum + day.predicted_revenue, 0);

      // Calculate location-wise weekly totals
      const locationWeeklyTotals = {};
      for (const zone of Object.keys(locationBreakdown)) {
        locationWeeklyTotals[zone] = {
          total_quantity: 0,
          total_revenue: 0
        };
      }

      for (const day of dailyForecasts) {
        for (const [zone, dist] of Object.entries(day.location_distribution)) {
          locationWeeklyTotals[zone].total_quantity += dist.predicted_quantity;
          locationWeeklyTotals[zone].total_revenue += dist.predicted_revenue;
        }
      }

      return {
        week_start: new Date().toISOString().split('T')[0],
        week_end: endDate.toISOString().split('T')[0],
        daily_forecasts: dailyForecasts,
        location_insights: {
          historical_distribution: locationBreakdown,
          predicted_distribution: locationWeeklyTotals,
          peak_delivery_zone: Object.entries(locationWeeklyTotals).reduce((max, [zone, data]) =>
            data.total_quantity > (max[1]?.total_quantity || 0) ? [zone, data] : max, [null, {}])[0],
          delivery_zones_count: Object.keys(locationBreakdown).length
        },
        summary: {
          total_predicted_quantity: weeklyQuantity,
          total_predicted_revenue: Math.round(weeklyRevenue * 100) / 100,
          avg_daily_quantity: Math.round(weeklyQuantity / 7),
          avg_daily_revenue: Math.round(weeklyRevenue / 7 * 100) / 100
        }
      };
    } catch (error) {
      console.error('Error getting weekly forecast with location:', error);
      throw error;
    }
  }

  /**
   * Refresh cached forecasts for a merchant
   * @param {Number} merchantId
   * @returns {Promise<Object>}
   */
  async refreshForecasts(merchantId) {
    try {
      const result = await this.generateProductForecasts(merchantId);
      return {
        message: 'Forecasts refreshed successfully',
        ...result.summary
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate four-layer ensemble forecast for a product
   * Orchestrates all layers: Layer 1 (Prophet), Layer 2 (XGBoost), Layer 3 (Context), Layer 4 (Ensemble)
   * @param {Number} productId - Product ID
   * @param {Number} merchantId - Merchant ID
   * @param {Object} layer1Forecast - Layer 1 forecast result from Prophet
   * @param {Object} regressors - External regressors by date
   * @returns {Promise<Object>} - Final ensemble forecast with all layers
   */
  async generateEnsembleForecast(productId, merchantId, layer1Forecast, regressors) {
    try {
      console.log(`[EnsembleForecast] Starting 4-layer ensemble for product ${productId}`);

      // Extract Layer 1 predictions
      const layer1Predictions = (layer1Forecast.forecast || []).map(pred => ({
        date: pred.ds ? pred.ds.split('T')[0] : pred.date,
        yhat: parseFloat(pred.yhat)
      }));

      if (layer1Predictions.length === 0) {
        throw new Error('Layer 1 forecast is empty');
      }

      // Get historical sales data for Layer 2 training
      const salesHistory = await this.getProductSalesHistory(productId, 180);
      const salesData = salesHistory.map(h => ({
        date: h.date,
        quantity: h.quantity
      }));

      // ========== LAYER 2: XGBoost Residual Correction ==========
      console.log(`[Layer2] Running XGBoost residual correction...`);
      let layer2Result = null;
      try {
        layer2Result = await PredictionScriptsService.runLayer2ResidualCorrection(
          salesData,
          layer1Predictions,
          regressors,
          layer1Predictions.map(p => p.date)
        );

        if (layer2Result.success && layer2Result.residual_corrections) {
          console.log(`[Layer2] Success - corrected ${layer2Result.residual_corrections.length} predictions`);
        } else {
          console.warn('[Layer2] Failed, using Layer 1 predictions as fallback');
          layer2Result = null;
        }
      } catch (layer2Error) {
        console.warn(`[Layer2] Error (using Layer 1 fallback):`, layer2Error.message);
      }

      // Prepare Layer 2 predictions for Layer 3
      let layer2Predictions;
      if (layer2Result && layer2Result.residual_corrections) {
        layer2Predictions = layer2Result.residual_corrections.map(corr => ({
          date: corr.date,
          corrected_yhat: corr.corrected_yhat || corr.layer1_yhat
        }));
      } else {
        // Fallback to Layer 1 if Layer 2 fails
        layer2Predictions = layer1Predictions.map(p => ({
          date: p.date,
          corrected_yhat: p.yhat
        }));
      }

      // ========== LAYER 3: Context Rules Engine ==========
      console.log(`[Layer3] Running context rules engine...`);
      let layer3Result = null;
      try {
        layer3Result = await PredictionScriptsService.runLayer3ContextRules(
          layer2Predictions,
          regressors
        );

        if (layer3Result.success && layer3Result.context_adjustments) {
          console.log(`[Layer3] Success - applied context rules to ${layer3Result.context_adjustments.length} predictions`);
        } else {
          console.warn('[Layer3] Failed, using Layer 2 predictions as fallback');
          layer3Result = null;
        }
      } catch (layer3Error) {
        console.warn(`[Layer3] Error (using Layer 2 fallback):`, layer3Error.message);
      }

      // Prepare Layer 3 predictions for Layer 4
      let layer3Predictions;
      if (layer3Result && layer3Result.context_adjustments) {
        layer3Predictions = layer3Result.context_adjustments.map(adj => ({
          date: adj.date,
          final_yhat: adj.final_yhat
        }));
      } else {
        // Fallback to Layer 2 if Layer 3 fails
        layer3Predictions = layer2Predictions.map(p => ({
          date: p.date,
          final_yhat: p.corrected_yhat
        }));
      }

      // ========== LAYER 4: Adaptive Ensemble Weights ==========
      console.log(`[Layer4] Running adaptive ensemble weights...`);
      let layer4Result = null;
      try {
        // Determine forecast horizon based on dates
        const firstDate = new Date(layer1Predictions[0].date);
        const lastDate = new Date(layer1Predictions[layer1Predictions.length - 1].date);
        const daysSpan = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
        let horizon = 'medium';
        if (daysSpan <= 3) horizon = 'short';
        else if (daysSpan > 7) horizon = 'long';

        layer4Result = await PredictionScriptsService.runLayer4EnsembleWeights(
          layer1Predictions,
          layer2Predictions,
          layer3Predictions,
          salesData, // Use historical data for performance evaluation
          productId,
          horizon
        );

        if (layer4Result.success && layer4Result.ensemble_predictions) {
          console.log(`[Layer4] Success - ensemble combined ${layer4Result.ensemble_predictions.length} predictions`);
        } else {
          console.warn('[Layer4] Failed, using Layer 3 predictions as fallback');
          layer4Result = null;
        }
      } catch (layer4Error) {
        console.warn(`[Layer4] Error (using Layer 3 fallback):`, layer4Error.message);
      }

      // ========== Final Result Assembly ==========
      let finalPredictions;
      if (layer4Result && layer4Result.ensemble_predictions) {
        finalPredictions = layer4Result.ensemble_predictions;
      } else {
        // Fallback to Layer 3
        finalPredictions = layer3Predictions.map(p => ({
          date: p.date,
          final_yhat: p.final_yhat
        }));
      }

      // Assemble comprehensive result with all layers
      const ensembleResult = {
        product_id: productId,
        merchant_id: merchantId,
        forecast_date: new Date().toISOString(),
        layers: {
          layer1: layer1Predictions.length > 0,
          layer2: layer2Result !== null,
          layer3: layer3Result !== null,
          layer4: layer4Result !== null
        },
        layer1_predictions: layer1Predictions,
        layer2_predictions: layer2Predictions,
        layer3_predictions: layer3Predictions,
        ensemble_predictions: finalPredictions,
        layer4_metadata: layer4Result ? {
          weights: layer4Result.weight_summary?.weights,
          confidence: layer4Result.weight_summary?.confidence,
          metrics: layer4Result.performance_metrics
        } : null,
        layer3_metadata: layer3Result ? {
          rule_statistics: layer3Result.rule_statistics
        } : null,
        layer2_metadata: layer2Result ? {
          model_stats: layer2Result.model_stats,
          feature_importance: layer2Result.feature_importance
        } : null,
        summary: {
          total_predictions: finalPredictions.length,
          avg_prediction: finalPredictions.reduce((sum, p) => sum + p.final_yhat, 0) / finalPredictions.length,
          min_prediction: Math.min(...finalPredictions.map(p => p.final_yhat)),
          max_prediction: Math.max(...finalPredictions.map(p => p.final_yhat))
        }
      };

      console.log(`[EnsembleForecast] Completed for product ${productId} with layers: L1=${ensembleResult.layers.layer1}, L2=${ensembleResult.layers.layer2}, L3=${ensembleResult.layers.layer3}, L4=${ensembleResult.layers.layer4}`);

      return ensembleResult;

    } catch (error) {
      console.error(`Error generating ensemble forecast for product ${productId}:`, error);
      throw error;
    }
  }
}

module.exports = new SalesPredictionService();
