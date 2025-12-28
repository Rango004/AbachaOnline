-- Migration: Add return tracking to refund system
-- This allows tracking whether items need to be returned and if merchant verified return

-- Add refund type (item_received or item_not_received)
ALTER TABLE refund_requests
ADD COLUMN refund_type VARCHAR(20) DEFAULT 'item_received' CHECK (refund_type IN ('item_received', 'item_not_received'));

-- Add return tracking fields
ALTER TABLE refund_requests
ADD COLUMN return_required BOOLEAN DEFAULT true,
ADD COLUMN return_status VARCHAR(20) DEFAULT 'pending_return' CHECK (return_status IN ('pending_return', 'customer_initiated_return', 'merchant_received', 'verified', 'not_required'));

-- Add merchant return verification timestamp
ALTER TABLE refund_requests
ADD COLUMN merchant_verified_return_at TIMESTAMP;

-- Add notes for return process
ALTER TABLE refund_requests
ADD COLUMN return_notes TEXT;

-- Update existing records
UPDATE refund_requests
SET refund_type = 'item_received',
    return_required = true,
    return_status = 'pending_return'
WHERE refund_type IS NULL;

-- Create index for return status queries
CREATE INDEX idx_refund_requests_return_status ON refund_requests(return_status);
CREATE INDEX idx_refund_requests_refund_type ON refund_requests(refund_type);

COMMENT ON COLUMN refund_requests.refund_type IS 'Type of refund: item_received (needs return) or item_not_received (no return needed)';
COMMENT ON COLUMN refund_requests.return_required IS 'Whether physical return of goods is required';
COMMENT ON COLUMN refund_requests.return_status IS 'Status of item return process';
COMMENT ON COLUMN refund_requests.merchant_verified_return_at IS 'When merchant verified receipt of returned goods';
COMMENT ON COLUMN refund_requests.return_notes IS 'Notes about the return process';
