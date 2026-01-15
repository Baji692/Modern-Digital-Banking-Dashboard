"""
Migration script to add Redemptions and Referrals tables to the database.
Run this script once to create the necessary tables.
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost/banking_app")

engine = create_engine(DATABASE_URL)

# SQL statements to create tables
migration_sql = """
-- Create Redemptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS redemptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    redemption_type VARCHAR(50) NOT NULL,
    points_used INTEGER NOT NULL,
    amount_value NUMERIC(12, 2) NOT NULL,
    partner VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create Referrals table if it doesn't exist
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER NOT NULL REFERENCES users(id),
    referred_email VARCHAR(100) NOT NULL,
    referred_user_id INTEGER REFERENCES users(id),
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    bonus_points INTEGER DEFAULT 500,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON redemptions(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
"""

try:
    with engine.connect() as connection:
        # Execute each statement separately
        statements = [s.strip() for s in migration_sql.split(';') if s.strip()]
        for statement in statements:
            print(f"Executing: {statement[:60]}...")
            connection.execute(text(statement))
        connection.commit()
        print("\n✅ Migration completed successfully!")
        print("Tables created: redemptions, referrals")
except Exception as e:
    print(f"\n❌ Migration failed: {str(e)}")
    raise
finally:
    engine.dispose()
