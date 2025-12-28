const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

/**
 * FeaturesService: Generates external regressors for forecasting
 * Wraps the Python features.py module for feature engineering
 */
class FeaturesService {
  /**
   * Generate features for a specific merchant and time period
   * @param {Number} merchantId - Merchant ID
   * @param {Number} categoryId - Product category ID (optional)
   * @param {String} hostelZone - Hostel zone (north/south/east/west/center)
   * @param {Number} basePrice - Base price of product (optional)
   * @param {Number} periods - Number of days to forecast (default: 14)
   * @param {Array} campusHolidays - Array of holiday dates ['YYYY-MM-DD']
   * @returns {Promise<Object>} - Dictionary with date keys and feature objects
   */
  async generateForecastFeatures(
    merchantId,
    categoryId = null,
    hostelZone = null,
    basePrice = null,
    periods = 14,
    campusHolidays = []
  ) {
    return new Promise((resolve, reject) => {
      try {
        // Validate inputs
        if (!merchantId || merchantId < 0) {
          return reject(new Error('Invalid merchant ID'));
        }

        if (periods < 1 || periods > 365) {
          return reject(new Error('Periods must be between 1 and 365'));
        }

        // Determine Python executable
        const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';

        // Script path
        const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'features.py');

        // Create child process
        const pythonProcess = spawn(pythonExecutable, [scriptPath], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 30000 // 30 second timeout
        });

        let stdout = '';
        let stderr = '';

        // Prepare input data
        const inputData = {
          merchant_id: merchantId,
          category_id: categoryId,
          hostel_zone: hostelZone,
          base_price: basePrice,
          periods: periods,
          campus_holidays: campusHolidays,
          mode: 'forecast'
        };

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
          console.error('[FeaturesService] stderr:', data.toString());
        });

        // Handle process completion
        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            return reject(
              new Error(`Feature generation failed with code ${code}: ${stderr}`)
            );
          }

          try {
            const result = JSON.parse(stdout);

            if (!result.success) {
              return reject(new Error(result.error || 'Feature generation failed'));
            }

            resolve(result.features);
          } catch (parseError) {
            reject(new Error(`Failed to parse features output: ${parseError.message}`));
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
   * Generate historical features for a date range
   * @param {Number} merchantId - Merchant ID
   * @param {String} startDate - Start date (YYYY-MM-DD)
   * @param {String} endDate - End date (YYYY-MM-DD)
   * @param {Number} categoryId - Product category ID (optional)
   * @param {String} hostelZone - Hostel zone
   * @param {Number} basePrice - Base price
   * @param {Array} campusHolidays - Campus holidays
   * @returns {Promise<Object>} - Features for each date in range
   */
  async generateHistoricalFeatures(
    merchantId,
    startDate,
    endDate,
    categoryId = null,
    hostelZone = null,
    basePrice = null,
    campusHolidays = []
  ) {
    return new Promise((resolve, reject) => {
      try {
        const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
        const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'features.py');

        const pythonProcess = spawn(pythonExecutable, [scriptPath], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 30000
        });

        let stdout = '';
        let stderr = '';

        const inputData = {
          merchant_id: merchantId,
          category_id: categoryId,
          hostel_zone: hostelZone,
          base_price: basePrice,
          start_date: startDate,
          end_date: endDate,
          campus_holidays: campusHolidays,
          mode: 'historical'
        };

        pythonProcess.stdin.write(JSON.stringify(inputData));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            return reject(
              new Error(`Historical feature generation failed with code ${code}: ${stderr}`)
            );
          }

          try {
            const result = JSON.parse(stdout);

            if (!result.success) {
              return reject(new Error(result.error || 'Feature generation failed'));
            }

            resolve(result.features);
          } catch (parseError) {
            reject(new Error(`Failed to parse features: ${parseError.message}`));
          }
        });

        pythonProcess.on('error', (err) => {
          reject(new Error(`Failed to spawn Python process: ${err.message}`));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate temporal features only (no external regressors)
   * Useful for quick generation without merchant/product context
   * @param {Number} periods - Number of days to generate features for
   * @param {Array} campusHolidays - Campus holidays
   * @returns {Promise<Object>} - Features with temporal data
   */
  async generateTemporalFeatures(periods = 14, campusHolidays = []) {
    return this.generateForecastFeatures(0, null, null, null, periods, campusHolidays);
  }

  /**
   * Format features for use with forecast.py
   * Takes the feature output and ensures it's in the correct format
   * @param {Object} features - Raw features from feature generation
   * @returns {Object} - Formatted features dict with date keys
   */
  formatFeaturesForForecast(features) {
    if (!features || typeof features !== 'object') {
      return {};
    }

    // Features should already be in correct format: { "YYYY-MM-DD": {...}, ... }
    return features;
  }
}

module.exports = new FeaturesService();
