-- Migration 028: Comprehensive migration for all missing tables and columns
-- Creates all tables referenced in code but not yet in migrations

-- =====================================================
-- 1. ORDER STATUS HISTORY - Track all order status changes
-- =====================================================
CREATE TABLE IF NOT EXISTS order_status_history (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id, created_at DESC);

-- =====================================================
-- 2. MERCHANT PAYMENT TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS merchant_sales (
    id SERIAL PRIMARY KEY,
    merchant_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchant_balances (
    id SERIAL PRIMARY KEY,
    merchant_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    available_balance DECIMAL(10,2) DEFAULT 0,
    pending_balance DECIMAL(10,2) DEFAULT 0,
    total_earned DECIMAL(10,2) DEFAULT 0,
    total_withdrawn DECIMAL(10,2) DEFAULT 0,
    last_payout_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchant_transactions (
    id SERIAL PRIMARY KEY,
    merchant_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('sale', 'commission', 'payout', 'refund', 'adjustment')),
    amount DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2),
    reference_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchant_payouts (
    id SERIAL PRIMARY KEY,
    merchant_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payout_items (
    id SERIAL PRIMARY KEY,
    payout_id INT NOT NULL REFERENCES merchant_payouts(id) ON DELETE CASCADE,
    order_id INT REFERENCES orders(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL
);

-- =====================================================
-- 3. RIDER LOCATION TRACKING
-- =====================================================
CREATE TABLE IF NOT EXISTS rider_current_location (
    rider_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    accuracy DECIMAL(8,2),
    heading DECIMAL(5,2),
    speed DECIMAL(8,2),
    is_online BOOLEAN DEFAULT false,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. SALES PREDICTION TABLES (AI/ML Forecasting)
-- =====================================================
CREATE TABLE IF NOT EXISTS sales_predictions (
    id SERIAL PRIMARY KEY,
    merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    predicted_quantity INT,
    confidence_score DECIMAL(5,4),
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS layer2_predictions (
    id SERIAL PRIMARY KEY,
    merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    predicted_demand DECIMAL(10,2),
    confidence_interval_lower DECIMAL(10,2),
    confidence_interval_upper DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS layer3_predictions (
    id SERIAL PRIMARY KEY,
    merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    adjusted_demand DECIMAL(10,2),
    weather_factor DECIMAL(5,2),
    event_factor DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS layer4_predictions (
    id SERIAL PRIMARY KEY,
    merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    final_prediction DECIMAL(10,2),
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ensemble_forecast_metadata (
    id SERIAL PRIMARY KEY,
    merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
    forecast_run_date DATE NOT NULL,
    model_versions JSONB,
    accuracy_metrics JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. HOLIDAYS AND EVENTS (for forecast adjustments)
-- =====================================================
CREATE TABLE IF NOT EXISTS holidays_events (
    id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) DEFAULT 'holiday',
    impact_factor DECIMAL(5,2) DEFAULT 1.0,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchant_event_overrides (
    id SERIAL PRIMARY KEY,
    merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
    event_id INT REFERENCES holidays_events(id) ON DELETE CASCADE,
    custom_impact_factor DECIMAL(5,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 6. FORECAST METRICS
-- =====================================================
CREATE TABLE IF NOT EXISTS forecast_metrics (
    id SERIAL PRIMARY KEY,
    merchant_id INT REFERENCES users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    predicted_value DECIMAL(10,2),
    actual_value DECIMAL(10,2),
    error_rate DECIMAL(8,4),
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 7. ROUTE OPTIMIZATION JOBS
-- =====================================================
CREATE TABLE IF NOT EXISTS route_optimization_jobs (
    id SERIAL PRIMARY KEY,
    rider_id INT REFERENCES users(id) ON DELETE SET NULL,
    merchant_id INT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending',
    order_ids INT[],
    optimized_route JSONB,
    total_distance_km DECIMAL(8,2),
    estimated_duration_minutes INT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- =====================================================
-- 8. WEBSOCKET ADDITIONAL TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS websocket_events (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS websocket_pending_messages (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(100) NOT NULL,
    message_data JSONB NOT NULL,
    delivered BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP
);

-- =====================================================
-- 9. ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================

-- Orders: picked_up_at timestamp
ALTER TABLE orders ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP;

-- Users: is_active flag
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_merchant_sales_merchant ON merchant_sales(merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_merchant_transactions_merchant ON merchant_transactions(merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_predictions_date ON sales_predictions(merchant_id, prediction_date);
CREATE INDEX IF NOT EXISTS idx_holidays_events_date ON holidays_events(event_date);
CREATE INDEX IF NOT EXISTS idx_websocket_pending_delivered ON websocket_pending_messages(user_id, delivered);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Add comments
COMMENT ON TABLE order_status_history IS 'Tracks all order status transitions for audit trail';
COMMENT ON TABLE merchant_balances IS 'Current balance and payout history for each merchant';
COMMENT ON TABLE rider_current_location IS 'Real-time location of active riders';
COMMENT ON TABLE route_optimization_jobs IS 'Route optimization calculation jobs and results';
