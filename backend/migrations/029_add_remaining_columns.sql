-- Migration 029: Add remaining missing columns for refunds and predictions

-- Add end_date to holidays_events for multi-day events
ALTER TABLE holidays_events ADD COLUMN IF NOT EXISTS end_date DATE;
COMMENT ON COLUMN holidays_events.end_date IS 'End date for multi-day events (optional)';

-- Add prediction_error_percent to forecast_metrics
ALTER TABLE forecast_metrics ADD COLUMN IF NOT EXISTS prediction_error_percent DECIMAL(8,4);
COMMENT ON COLUMN forecast_metrics.prediction_error_percent IS 'Prediction error as percentage';

-- Ensure refund_requests has all required columns
ALTER TABLE refund_requests ADD COLUMN IF NOT EXISTS customer_id INT REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_refund_requests_customer ON refund_requests(customer_id);
