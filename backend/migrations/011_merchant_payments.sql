-- Create merchant balances table
CREATE TABLE IF NOT EXISTS merchant_balances (
    merchant_id INTEGER PRIMARY KEY REFERENCES users(id),
    balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create merchant transactions table
CREATE TABLE IF NOT EXISTS merchant_transactions (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER REFERENCES users(id),
    order_id INTEGER REFERENCES orders(id),
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'credit', 'debit', 'withdrawal'
    balance_after DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_merchant_transactions_merchant ON merchant_transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_transactions_created ON merchant_transactions(created_at DESC);
