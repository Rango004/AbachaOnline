-- Session 3: Four-Layer Ensemble Forecasting
-- Add tables to store predictions from all four layers and ensemble metadata

-- Table to store Layer 2 (XGBoost Residual Correction) predictions
CREATE TABLE IF NOT EXISTS layer2_predictions (
  id SERIAL PRIMARY KEY,
  merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  layer1_yhat NUMERIC(10,2),
  residual_correction NUMERIC(10,2),
  corrected_yhat NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (merchant_id, product_id, prediction_date)
);

CREATE INDEX idx_layer2_merchant_date ON layer2_predictions(merchant_id, prediction_date);
CREATE INDEX idx_layer2_product_date ON layer2_predictions(product_id, prediction_date);

-- Table to store Layer 3 (Context Rules Engine) predictions
CREATE TABLE IF NOT EXISTS layer3_predictions (
  id SERIAL PRIMARY KEY,
  merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  layer2_yhat NUMERIC(10,2),
  contexts JSONB, -- JSON array of context labels: ["exam_period", "weekend", ...]
  adjustment_factor NUMERIC(5,3), -- Multiplicative adjustment
  rule_adjustments JSONB, -- JSON array of rule applications
  final_yhat NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (merchant_id, product_id, prediction_date)
);

CREATE INDEX idx_layer3_merchant_date ON layer3_predictions(merchant_id, prediction_date);
CREATE INDEX idx_layer3_product_date ON layer3_predictions(product_id, prediction_date);

-- Table to store Layer 4 (Adaptive Ensemble Weights) predictions
CREATE TABLE IF NOT EXISTS layer4_predictions (
  id SERIAL PRIMARY KEY,
  merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  layer1_yhat NUMERIC(10,2),
  layer2_yhat NUMERIC(10,2),
  layer3_yhat NUMERIC(10,2),
  ensemble_weights JSONB, -- {"layer1": 0.25, "layer2": 0.40, "layer3": 0.35}
  final_yhat NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (merchant_id, product_id, prediction_date)
);

CREATE INDEX idx_layer4_merchant_date ON layer4_predictions(merchant_id, prediction_date);
CREATE INDEX idx_layer4_product_date ON layer4_predictions(product_id, prediction_date);

-- Table to store ensemble forecast metadata and statistics
CREATE TABLE IF NOT EXISTS ensemble_forecast_metadata (
  id SERIAL PRIMARY KEY,
  merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  forecast_date TIMESTAMP NOT NULL,
  layers_succeeded JSONB, -- {"layer1": true, "layer2": true, "layer3": false, "layer4": true}
  layer2_model_stats JSONB, -- {"rmse": 45.23, "mae": 28.15, "r2": 0.72}
  layer2_feature_importance JSONB, -- Feature importance scores
  layer3_rule_statistics JSONB, -- Rule application counts
  layer4_weights JSONB, -- Final ensemble weights
  layer4_confidence NUMERIC(5,3), -- Confidence score (0-1)
  layer4_performance_metrics JSONB, -- {"mape": 8.5, "rmse": 42.3, "mae": 28.1}
  forecast_horizon VARCHAR(20), -- 'short', 'medium', or 'long'
  total_predictions INT,
  avg_prediction NUMERIC(10,2),
  min_prediction NUMERIC(10,2),
  max_prediction NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ensemble_metadata_merchant_date ON ensemble_forecast_metadata(merchant_id, forecast_date);
CREATE INDEX idx_ensemble_metadata_product ON ensemble_forecast_metadata(product_id);

-- Table to store XGBoost model training data (Layer 2)
CREATE TABLE IF NOT EXISTS xgboost_model_data (
  id SERIAL PRIMARY KEY,
  merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  model_version VARCHAR(50),
  training_date TIMESTAMP NOT NULL,
  num_samples INT,
  rmse NUMERIC(10,2),
  mae NUMERIC(10,2),
  r2 NUMERIC(5,3),
  feature_importance JSONB, -- Feature importance scores
  training_params JSONB, -- Hyperparameters used
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_xgboost_product ON xgboost_model_data(product_id, training_date);

-- Table to store context rules configuration and application history
CREATE TABLE IF NOT EXISTS context_rules_config (
  id SERIAL PRIMARY KEY,
  rule_name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50), -- 'boost', 'reduction', 'seasonal', etc.
  base_factor NUMERIC(5,3), -- Default multiplicative factor
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  parameters JSONB, -- Rule-specific parameters
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (rule_name)
);

-- Insert default context rules
INSERT INTO context_rules_config (rule_name, rule_type, base_factor, description, parameters) VALUES
  ('exam_period_boost', 'boost', 1.25, 'Increase forecast during exam periods', '{"impact": 0.25}'),
  ('weekend_reduction', 'reduction', 0.85, 'Decrease forecast on weekends', '{"impact": -0.15}'),
  ('holiday_reduction', 'reduction', 0.70, 'Significant reduction on holidays', '{"impact": -0.30}'),
  ('high_demand_zone_boost', 'boost', 1.15, 'Increase in high-demand delivery zones', '{"impact": 0.15}'),
  ('payday_boost', 'boost', 1.18, 'Increase on payday (22-25)', '{"impact": 0.18}'),
  ('semester_start_boost', 'boost', 1.12, 'Increase at semester start', '{"impact": 0.12}'),
  ('semester_end_reduction', 'reduction', 0.90, 'Reduction at semester end', '{"impact": -0.10}')
ON CONFLICT (rule_name) DO NOTHING;

-- Table to store ensemble weight optimization history
CREATE TABLE IF NOT EXISTS ensemble_weight_history (
  id SERIAL PRIMARY KEY,
  merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  forecast_horizon VARCHAR(20), -- 'short', 'medium', 'long'
  layer1_weight NUMERIC(5,3),
  layer2_weight NUMERIC(5,3),
  layer3_weight NUMERIC(5,3),
  confidence_score NUMERIC(5,3),
  performance_mape NUMERIC(5,2), -- Mean Absolute Percentage Error
  optimization_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ensemble_weight_history_product ON ensemble_weight_history(product_id, optimization_date);

-- Alter sales_predictions to support ensemble integration
ALTER TABLE sales_predictions
ADD COLUMN IF NOT EXISTS layer1_yhat NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS layer2_yhat NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS layer3_yhat NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS layer4_yhat NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS final_ensemble_yhat NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS ensemble_confidence NUMERIC(5,3),
ADD COLUMN IF NOT EXISTS forecast_method VARCHAR(50) DEFAULT 'layer1'; -- Which method generated this

-- Create view for quick access to latest ensemble predictions
CREATE OR REPLACE VIEW latest_ensemble_predictions AS
SELECT
  sp.merchant_id,
  sp.product_id,
  sp.prediction_date,
  sp.predicted_quantity as layer1_prediction,
  l2p.corrected_yhat as layer2_prediction,
  l3p.final_yhat as layer3_prediction,
  l4p.final_yhat as layer4_prediction,
  sp.final_ensemble_yhat,
  sp.ensemble_confidence,
  efm.forecast_horizon,
  efm.layer4_confidence as overall_confidence
FROM sales_predictions sp
LEFT JOIN layer2_predictions l2p ON sp.merchant_id = l2p.merchant_id AND sp.product_id = l2p.product_id AND sp.prediction_date = l2p.prediction_date
LEFT JOIN layer3_predictions l3p ON sp.merchant_id = l3p.merchant_id AND sp.product_id = l3p.product_id AND sp.prediction_date = l3p.prediction_date
LEFT JOIN layer4_predictions l4p ON sp.merchant_id = l4p.merchant_id AND sp.product_id = l4p.product_id AND sp.prediction_date = l4p.prediction_date
LEFT JOIN ensemble_forecast_metadata efm ON sp.merchant_id = efm.merchant_id AND sp.product_id = efm.product_id AND DATE(efm.forecast_date) = sp.prediction_date
ORDER BY sp.prediction_date DESC;

-- Success message
SELECT 'Ensemble forecast layer tables created successfully!' AS status;
