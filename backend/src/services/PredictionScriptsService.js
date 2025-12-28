const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

class PredictionScriptsService {
  /**
   * Run Prophet forecast using Python child process
   * @param {Array} salesData - Array of {date, quantity} objects
   * @param {Array} events - Array of holiday/event objects
   * @param {Number} periods - Number of days to forecast
   * @param {Number} intervalWidth - Confidence interval (0.8 or 0.95)
   * @param {Object} regressors - External regressors dict with date keys (optional)
   * @returns {Promise<Object>} - Forecast result with predictions
   */
  async runProphetForecast(salesData, events = [], periods = 14, intervalWidth = 0.8, regressors = null) {
    return new Promise((resolve, reject) => {
      try {
        // Validate inputs
        if (!Array.isArray(salesData) || salesData.length === 0) {
          return reject(new Error('Sales data must be a non-empty array'));
        }

        if (periods < 1 || periods > 365) {
          return reject(new Error('Periods must be between 1 and 365'));
        }

        if (intervalWidth !== 0.8 && intervalWidth !== 0.95) {
          return reject(new Error('Interval width must be 0.8 or 0.95'));
        }

        // Determine Python executable (use 'py' launcher on Windows for Python 3.14)
        const pythonExecutable = process.platform === 'win32' ? 'py' : 'python3';

        // Script path
        const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'forecast.py');

        // Create child process
        const pythonProcess = spawn(pythonExecutable, [scriptPath], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 60000 // 60 second timeout
        });

        let stdout = '';
        let stderr = '';

        // Prepare input data
        const inputData = {
          sales_data: salesData,
          events: events,
          periods: periods,
          interval_width: intervalWidth
        };

        // Add external regressors if provided
        if (regressors && typeof regressors === 'object') {
          inputData.regressors = regressors;
        }

        // Send data to Python process
        pythonProcess.stdin.write(JSON.stringify(inputData));
        pythonProcess.stdin.end();

        // Capture stdout
        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        // Capture stderr
        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
          console.error('Prophet script stderr:', data.toString());
        });

        // Handle process completion
        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            return reject(new Error(`Python process failed with code ${code}: ${stderr}`));
          }

          try {
            const result = JSON.parse(stdout);

            if (!result.success) {
              return reject(new Error(result.error || 'Forecast generation failed'));
            }

            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse Prophet output: ${parseError.message}`));
          }
        });

        // Handle process errors
        pythonProcess.on('error', (err) => {
          reject(new Error(`Failed to spawn Python process: ${err.message}`));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Run forecast for a product with retry logic
   * @param {Number} merchantId - Merchant ID
   * @param {Number} productId - Product ID
   * @param {Array} salesData - Historical sales data
   * @param {Array} events - Holiday/event data
   * @param {Object} regressors - External regressors (optional)
   * @returns {Promise<Object>}
   */
  async runProductForecast(merchantId, productId, salesData, events = [], regressors = null) {
    const maxRetries = 2;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Forecast] Attempt ${attempt} for product ${productId} (merchant ${merchantId})`);

        const forecast = await this.runProphetForecast(salesData, events, 14, 0.8, regressors);

        // Add metadata
        forecast.merchant_id = merchantId;
        forecast.product_id = productId;
        forecast.forecast_date = new Date().toISOString();

        return forecast;
      } catch (error) {
        lastError = error;
        console.error(`[Forecast] Attempt ${attempt} failed for product ${productId}:`, error.message);

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw new Error(`Forecast failed after ${maxRetries} attempts: ${lastError.message}`);
  }

  /**
   * Generate forecasts for multiple products in parallel
   * @param {Number} merchantId - Merchant ID
   * @param {Array} productsData - Array of {product_id, sales_data, events, regressors} objects
   * @param {Number} maxConcurrent - Maximum concurrent forecasts
   * @param {Object} globalRegressors - Global regressors for all products (optional)
   * @returns {Promise<Object>} - Results with successful and failed forecasts
   */
  async runBulkForecasts(merchantId, productsData, maxConcurrent = 3, globalRegressors = null) {
    const results = {
      successful: [],
      failed: [],
      summary: {
        total: productsData.length,
        successful_count: 0,
        failed_count: 0
      }
    };

    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < productsData.length; i += maxConcurrent) {
      const batch = productsData.slice(i, i + maxConcurrent);

      const batchPromises = batch.map(async (productData) => {
        try {
          // Use product-specific regressors if available, otherwise use global regressors
          const regressors = productData.regressors || globalRegressors;

          const forecast = await this.runProductForecast(
            merchantId,
            productData.product_id,
            productData.sales_data,
            productData.events || [],
            regressors
          );

          results.successful.push(forecast);
          results.summary.successful_count++;
        } catch (error) {
          results.failed.push({
            product_id: productData.product_id,
            error: error.message
          });
          results.summary.failed_count++;
        }
      });

      await Promise.all(batchPromises);
    }

    return results;
  }

  /**
   * Validate sales data format
   * @param {Array} salesData
   * @returns {Object} - Validation result
   */
  validateSalesData(salesData) {
    if (!Array.isArray(salesData)) {
      return { valid: false, error: 'Sales data must be an array' };
    }

    if (salesData.length < 60) {
      return { valid: false, error: 'Need at least 60 days of historical data' };
    }

    // Check each record
    for (let i = 0; i < salesData.length; i++) {
      const record = salesData[i];

      if (!record.date || !record.quantity) {
        return { valid: false, error: `Record ${i} missing required fields (date, quantity)` };
      }

      // Validate date format
      const date = new Date(record.date);
      if (isNaN(date.getTime())) {
        return { valid: false, error: `Record ${i} has invalid date format` };
      }

      // Validate quantity is positive number
      if (typeof record.quantity !== 'number' || record.quantity < 0) {
        return { valid: false, error: `Record ${i} has invalid quantity (must be non-negative number)` };
      }
    }

    return { valid: true };
  }

  /**
   * Validate events data format
   * @param {Array} events
   * @returns {Object} - Validation result
   */
  validateEvents(events) {
    if (!Array.isArray(events)) {
      return { valid: false, error: 'Events must be an array' };
    }

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      if (!event.date || !event.name) {
        return { valid: false, error: `Event ${i} missing required fields (date, name)` };
      }

      const date = new Date(event.date);
      if (isNaN(date.getTime())) {
        return { valid: false, error: `Event ${i} has invalid date format` };
      }
    }

    return { valid: true };
  }

  /**
   * Layer 2: Run XGBoost Residual Correction
   * @param {Array} salesData - Historical sales data
   * @param {Array} layer1Predictions - Layer 1 forecast predictions
   * @param {Object} regressors - External regressors by date
   * @param {Array} forecastDates - Dates to forecast (optional)
   * @returns {Promise<Object>} - Residual corrections
   */
  async runLayer2ResidualCorrection(salesData, layer1Predictions, regressors, forecastDates = null) {
    return new Promise((resolve, reject) => {
      try {
        const pythonExecutable = process.platform === 'win32' ? 'py' : 'python3';
        const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'xgboost_residuals.py');

        const pythonProcess = spawn(pythonExecutable, [scriptPath], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 120000 // 2 minute timeout
        });

        let stdout = '';
        let stderr = '';

        const inputData = {
          sales_data: salesData,
          layer1_predictions: layer1Predictions,
          regressors: regressors
        };

        if (forecastDates) {
          inputData.forecast_dates = forecastDates;
        }

        pythonProcess.stdin.write(JSON.stringify(inputData));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
          console.error('Layer 2 script stderr:', data.toString());
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            return reject(new Error(`Layer 2 process failed with code ${code}: ${stderr}`));
          }

          try {
            const result = JSON.parse(stdout);
            if (!result.success) {
              return reject(new Error(result.error || 'Layer 2 processing failed'));
            }
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse Layer 2 output: ${parseError.message}`));
          }
        });

        pythonProcess.on('error', (err) => {
          reject(new Error(`Failed to spawn Layer 2 process: ${err.message}`));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Layer 3: Run Context Rules Engine
   * @param {Array} layer2Predictions - Layer 2 corrected predictions
   * @param {Object} regressors - External regressors by date
   * @returns {Promise<Object>} - Context-adjusted predictions
   */
  async runLayer3ContextRules(layer2Predictions, regressors) {
    return new Promise((resolve, reject) => {
      try {
        const pythonExecutable = process.platform === 'win32' ? 'py' : 'python3';
        const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'context_rules.py');

        const pythonProcess = spawn(pythonExecutable, [scriptPath], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 60000
        });

        let stdout = '';
        let stderr = '';

        const inputData = {
          layer2_predictions: layer2Predictions,
          regressors: regressors
        };

        pythonProcess.stdin.write(JSON.stringify(inputData));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
          console.error('Layer 3 script stderr:', data.toString());
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            return reject(new Error(`Layer 3 process failed with code ${code}: ${stderr}`));
          }

          try {
            const result = JSON.parse(stdout);
            if (!result.success) {
              return reject(new Error(result.error || 'Layer 3 processing failed'));
            }
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse Layer 3 output: ${parseError.message}`));
          }
        });

        pythonProcess.on('error', (err) => {
          reject(new Error(`Failed to spawn Layer 3 process: ${err.message}`));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Layer 4: Run Adaptive Ensemble Weights
   * @param {Array} layer1Predictions - Layer 1 base predictions
   * @param {Array} layer2Predictions - Layer 2 residual-corrected predictions
   * @param {Array} layer3Predictions - Layer 3 context-adjusted predictions
   * @param {Array} actualValues - Actual historical values (optional)
   * @param {Number} productId - Product ID (optional)
   * @param {String} forecastHorizon - 'short', 'medium', or 'long' (optional)
   * @returns {Promise<Object>} - Ensemble combined predictions
   */
  async runLayer4EnsembleWeights(layer1Predictions, layer2Predictions, layer3Predictions,
                                actualValues = null, productId = null, forecastHorizon = 'medium') {
    return new Promise((resolve, reject) => {
      try {
        const pythonExecutable = process.platform === 'win32' ? 'py' : 'python3';
        const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'ensemble_weights.py');

        const pythonProcess = spawn(pythonExecutable, [scriptPath], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 60000
        });

        let stdout = '';
        let stderr = '';

        const inputData = {
          layer1_predictions: layer1Predictions,
          layer2_predictions: layer2Predictions,
          layer3_predictions: layer3Predictions,
          forecast_horizon: forecastHorizon
        };

        if (productId) {
          inputData.product_id = productId;
        }

        if (actualValues) {
          inputData.actual_values = actualValues;
        }

        pythonProcess.stdin.write(JSON.stringify(inputData));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
          console.error('Layer 4 script stderr:', data.toString());
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            return reject(new Error(`Layer 4 process failed with code ${code}: ${stderr}`));
          }

          try {
            const result = JSON.parse(stdout);
            if (!result.success) {
              return reject(new Error(result.error || 'Layer 4 processing failed'));
            }
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse Layer 4 output: ${parseError.message}`));
          }
        });

        pythonProcess.on('error', (err) => {
          reject(new Error(`Failed to spawn Layer 4 process: ${err.message}`));
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new PredictionScriptsService();
