-- Migration: Add missing columns for analytics and admin dashboard
-- Fixes missing columns: refund_requests.merchant_id, orders.assigned_at, orders.delivered_at

-- =====================================================
-- 1. ORDERS TABLE - Add delivery tracking timestamps
-- =====================================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_id INT REFERENCES users(id) ON DELETE SET NULL;

-- Create indexes for delivery analytics
CREATE INDEX IF NOT EXISTS idx_orders_assigned_at ON orders(assigned_at) WHERE assigned_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_delivered_at ON orders(delivered_at) WHERE delivered_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON orders(rider_id) WHERE rider_id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN orders.assigned_at IS 'Timestamp when order was assigned to a rider';
COMMENT ON COLUMN orders.delivered_at IS 'Timestamp when order was delivered';
COMMENT ON COLUMN orders.rider_id IS 'ID of the rider assigned to deliver this order';

-- =====================================================
-- 2. REFUND_REQUESTS TABLE - Ensure it exists with merchant_id
-- =====================================================
-- First check if table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'refund_requests') THEN
        CREATE TABLE refund_requests (
            id SERIAL PRIMARY KEY,
            order_id INT REFERENCES orders(id) ON DELETE CASCADE,
            customer_id INT REFERENCES users(id) ON DELETE SET NULL,
            merchant_id INT REFERENCES users(id) ON DELETE SET NULL,
            reason TEXT NOT NULL,
            photo_data TEXT,
            status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            merchant_response TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX idx_refund_requests_order ON refund_requests(order_id);
        CREATE INDEX idx_refund_requests_merchant ON refund_requests(merchant_id, status);
        CREATE INDEX idx_refund_requests_customer ON refund_requests(customer_id);
    ELSE
        -- If table exists, ensure merchant_id column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns
                      WHERE table_name = 'refund_requests' AND column_name = 'merchant_id') THEN
            ALTER TABLE refund_requests ADD COLUMN merchant_id INT REFERENCES users(id) ON DELETE SET NULL;
            CREATE INDEX IF NOT EXISTS idx_refund_requests_merchant ON refund_requests(merchant_id, status);
        END IF;
    END IF;
END
$$;

-- =====================================================
-- 3. CONVERSATIONS TABLE - Ensure it exists for chat
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'conversations') THEN
        CREATE TABLE conversations (
            id SERIAL PRIMARY KEY,
            customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            merchant_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            product_id INT REFERENCES products(id) ON DELETE SET NULL,
            last_message_at TIMESTAMP DEFAULT NOW(),
            customer_unread_count INT DEFAULT 0,
            merchant_unread_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW(),
            CONSTRAINT unique_conversation UNIQUE(customer_id, merchant_id, product_id)
        );

        CREATE INDEX idx_conversations_customer ON conversations(customer_id, last_message_at DESC);
        CREATE INDEX idx_conversations_merchant ON conversations(merchant_id, last_message_at DESC);
    END IF;
END
$$;
