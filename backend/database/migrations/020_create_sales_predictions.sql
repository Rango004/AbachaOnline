-- Create sales_predictions table for storing Prophet forecasts
CREATE TABLE IF NOT EXISTS sales_predictions (
  id SERIAL PRIMARY KEY,
  merchant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  predicted_quantity NUMERIC(10, 2) NOT NULL,
  predicted_revenue NUMERIC(12, 2),
  confidence_lower NUMERIC(10, 2),
  confidence_upper NUMERIC(10, 2),
  confidence_level VARCHAR(10) DEFAULT '80', -- 80% or 95%
  trend VARCHAR(20), -- 'increasing', 'decreasing', 'stable'
  seasonality_factor NUMERIC(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(merchant_id, product_id, prediction_date)
);

-- Create index for faster queries
CREATE INDEX idx_sales_predictions_merchant_id ON sales_predictions(merchant_id);
CREATE INDEX idx_sales_predictions_product_id ON sales_predictions(product_id);
CREATE INDEX idx_sales_predictions_prediction_date ON sales_predictions(prediction_date);
CREATE INDEX idx_sales_predictions_merchant_date ON sales_predictions(merchant_id, prediction_date);

-- Create sales_forecast_cache table for caching
CREATE TABLE IF NOT EXISTS sales_forecast_cache (
  id SERIAL PRIMARY KEY,
  merchant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cache_key VARCHAR(255) NOT NULL UNIQUE,
  forecast_data JSONB NOT NULL,
  forecast_type VARCHAR(50), -- 'weekly', 'product_level', 'inventory'
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forecast_cache_merchant ON sales_forecast_cache(merchant_id);
CREATE INDEX idx_forecast_cache_expires ON sales_forecast_cache(expires_at);

-- Create forecast_metrics table to track prediction accuracy
CREATE TABLE IF NOT EXISTS forecast_metrics (
  id SERIAL PRIMARY KEY,
  merchant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  prediction_id INTEGER REFERENCES sales_predictions(id) ON DELETE SET NULL,
  predicted_quantity NUMERIC(10, 2),
  actual_quantity NUMERIC(10, 2),
  prediction_error_percent NUMERIC(5, 2),
  mape NUMERIC(5, 2), -- Mean Absolute Percentage Error
  evaluation_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forecast_metrics_merchant ON forecast_metrics(merchant_id);
CREATE INDEX idx_forecast_metrics_product ON forecast_metrics(product_id);
CREATE INDEX idx_forecast_metrics_evaluation_date ON forecast_metrics(evaluation_date);
