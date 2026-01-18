#!/usr/bin/env python3
"""
Migration: Add budget enhancement tables for new features
- budget_history: Track budget usage over 6 months
- budget_recommendations: AI-driven budget suggestions
- custom_budget_categories: User-created budget categories
- budget_subcategories: Optional sub-budgets within categories
- budget_alerts: Smart alerts for thresholds and predictions
Also adds new columns to budgets table: rollover_enabled, is_spending_frozen, color_code
"""

import sys
from sqlalchemy import text
from database import engine

# ========== NEW TABLES ==========
MIGRATION_SQL = """

-- Add new columns to existing budgets table
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS rollover_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS is_spending_frozen BOOLEAN DEFAULT FALSE;
ALTER TABLE budgets ADD COLUMN IF NOT EXISTS color_code VARCHAR(20) DEFAULT 'default';

-- Budget History Table - tracks spending trends over time
CREATE TABLE IF NOT EXISTS budget_history (
    id SERIAL PRIMARY KEY,
    budget_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    limit_amount NUMERIC(14, 2) NOT NULL,
    spent_amount NUMERIC(14, 2) DEFAULT 0.00,
    remaining_amount NUMERIC(14, 2) DEFAULT 0.00,
    usage_percent NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget Recommendations Table - AI suggestions
CREATE TABLE IF NOT EXISTS budget_recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    current_budget NUMERIC(14, 2),
    recommended_budget NUMERIC(14, 2) NOT NULL,
    average_spend NUMERIC(14, 2) NOT NULL,
    confidence_score NUMERIC(5, 2) DEFAULT 0.00,
    reasoning VARCHAR(500),
    is_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_at TIMESTAMP
);

-- Custom Budget Categories Table - user-defined categories
CREATE TABLE IF NOT EXISTS custom_budget_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category_name VARCHAR(50) NOT NULL,
    icon_emoji VARCHAR(10) DEFAULT '💰',
    color_hex VARCHAR(7) DEFAULT '#2563eb',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget Subcategories Table - nested budget tracking (e.g., Food > Dining, Food > Groceries)
CREATE TABLE IF NOT EXISTS budget_subcategories (
    id SERIAL PRIMARY KEY,
    budget_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    parent_category VARCHAR(50) NOT NULL,
    subcategory_name VARCHAR(50) NOT NULL,
    limit_amount NUMERIC(14, 2) NOT NULL,
    spent_amount NUMERIC(14, 2) DEFAULT 0.00,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget Alerts Table - smart threshold and prediction alerts
CREATE TABLE IF NOT EXISTS budget_alerts (
    id SERIAL PRIMARY KEY,
    budget_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    alert_type VARCHAR(20) NOT NULL,
    threshold_reached INTEGER DEFAULT 0,
    current_spending NUMERIC(14, 2) NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_budget_history_user ON budget_history(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_history_category ON budget_history(category);
CREATE INDEX IF NOT EXISTS idx_budget_recommendations_user ON budget_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_budget_categories_user ON custom_budget_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_subcategories_user ON budget_subcategories(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_user ON budget_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_budget ON budget_alerts(budget_id);

"""


def run_migration():
    try:
        with engine.connect() as connection:
            # Split and execute each statement separately
            statements = [s.strip()
                          for s in MIGRATION_SQL.split(';') if s.strip()]
            for statement in statements:
                print(f"Executing: {statement[:80]}...")
                connection.execute(text(statement))
                connection.commit()

        print("\n✅ Migration completed successfully!")
        return True
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        return False


if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
