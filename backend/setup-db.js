const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const sql = `
-- Connected accounts table
CREATE TABLE IF NOT EXISTS connected_accounts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  account_id TEXT,
  connected_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Earnings table with unique constraint to prevent duplicates
CREATE TABLE IF NOT EXISTS earnings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  source VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  platform VARCHAR(50),
  metadata JSONB, -- Store additional data like views, subscribers, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date, platform, source) -- Prevent duplicate entries
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  is_deductible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tax records table for storing quarterly estimates
CREATE TABLE IF NOT EXISTS tax_records (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  quarter INTEGER NOT NULL,
  estimated_tax DECIMAL(10, 2),
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, year, quarter)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_earnings_user_date ON earnings(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_earnings_platform ON earnings(platform);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_user ON connected_accounts(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_earnings_updated_at ON earnings;
CREATE TRIGGER update_earnings_updated_at BEFORE UPDATE ON earnings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_connected_accounts_updated_at ON connected_accounts;
CREATE TRIGGER update_connected_accounts_updated_at BEFORE UPDATE ON connected_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for monthly summaries
CREATE OR REPLACE VIEW monthly_summaries AS
SELECT 
  user_id,
  DATE_TRUNC('month', date) as month,
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_earnings,
  COUNT(CASE WHEN amount > 0 THEN 1 END) as earning_count
FROM earnings
GROUP BY user_id, DATE_TRUNC('month', date);

-- View for expense summaries by category
CREATE OR REPLACE VIEW expense_summaries AS
SELECT 
  user_id,
  category,
  DATE_TRUNC('year', date) as year,
  SUM(amount) as total_amount,
  COUNT(*) as expense_count
FROM expenses
WHERE is_deductible = TRUE
GROUP BY user_id, category, DATE_TRUNC('year', date);
`;

pool.query(sql, (err, res) => {
  if (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  } else {
    console.log('✅ Database tables and indexes created successfully!');
    console.log('✅ Triggers for updated_at created');
    console.log('✅ Views for summaries created');
  }
  pool.end();
});