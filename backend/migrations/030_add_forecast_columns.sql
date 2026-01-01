-- Migration 030: Add missing forecast/prediction columns

-- Add MAPE (Mean Absolute Percentage Error) to forecast_metrics
ALTER TABLE forecast_metrics ADD COLUMN IF NOT EXISTS mape DECIMAL(8,4);
COMMENT ON COLUMN forecast_metrics.mape IS 'Mean Absolute Percentage Error for forecast accuracy';

-- Add category to holidays_events
ALTER TABLE holidays_events ADD COLUMN IF NOT EXISTS category VARCHAR(50);
COMMENT ON COLUMN holidays_events.category IS 'Event category (e.g., holiday, exam, sports)';
