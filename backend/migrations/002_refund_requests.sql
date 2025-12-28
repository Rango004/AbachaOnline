-- Refund Requests Table
CREATE TABLE IF NOT EXISTS refund_requests (
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
