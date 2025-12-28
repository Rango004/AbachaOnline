-- Fix return_status column length
-- The previous migration set VARCHAR(20) but 'customer_initiated_return' is 26 chars

ALTER TABLE refund_requests
ALTER COLUMN return_status TYPE VARCHAR(30);

-- Update the check constraint to match
ALTER TABLE refund_requests
DROP CONSTRAINT IF EXISTS refund_requests_return_status_check;

ALTER TABLE refund_requests
ADD CONSTRAINT refund_requests_return_status_check
CHECK (return_status IN ('pending_return', 'customer_initiated_return', 'merchant_received', 'verified', 'not_required'));
