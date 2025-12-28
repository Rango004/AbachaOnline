-- Enhance Refund Tracking with Urge and Escalation
ALTER TABLE refund_requests
  ADD COLUMN IF NOT EXISTS customer_urged_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS escalated_to_admin BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS merchant_notified BOOLEAN DEFAULT FALSE;

-- Drop the old status constraint
ALTER TABLE refund_requests DROP CONSTRAINT IF EXISTS refund_requests_status_check;

-- Add new status constraint with more states
ALTER TABLE refund_requests
  ADD CONSTRAINT refund_requests_status_check
  CHECK (status IN ('pending', 'urged', 'escalated', 'approved', 'rejected', 'admin_reviewing'));

-- Update existing pending refunds to set merchant_notified flag
UPDATE refund_requests
SET merchant_notified = TRUE
WHERE status = 'pending';

-- Create index for faster queries on escalated refunds
CREATE INDEX IF NOT EXISTS idx_refund_escalated ON refund_requests(escalated_to_admin, escalated_at);

SELECT 'Refund tracking enhancements completed!' AS status;
