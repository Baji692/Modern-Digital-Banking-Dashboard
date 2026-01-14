#!/usr/bin/env python3
"""
Migration: Add All Missing Tables (Rewards, Alerts, AdminLogs)
This is a comprehensive migration to set up all three tables at once
"""

from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:admin123@localhost/BankDashboard")


def migrate_all():
    """Create all missing tables"""
    engine = create_engine(DATABASE_URL)

    try:
        print("Starting database migrations...")

        with engine.connect() as conn:
            # ========== REWARDS TABLE ==========
            print("\n[1/3] Creating rewards table...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS public.rewards (
                    id SERIAL PRIMARY KEY,
                    user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
                    program_name VARCHAR(100) NOT NULL,
                    points_balance INT DEFAULT 0,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_rewards_user_id 
                ON public.rewards(user_id);
            """))
            print("✓ Rewards table created successfully")

            # ========== ALERTS TABLE ==========
            print("\n[2/3] Creating alerts table...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS public.alerts (
                    id SERIAL PRIMARY KEY,
                    user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
                    type VARCHAR(50) NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_alerts_user_id 
                ON public.alerts(user_id);
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_alerts_type 
                ON public.alerts(type);
            """))
            print("✓ Alerts table created successfully")

            # ========== ADMIN LOGS TABLE ==========
            print("\n[3/3] Creating admin_logs table...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS public.admin_logs (
                    id SERIAL PRIMARY KEY,
                    admin_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
                    action TEXT NOT NULL,
                    target_type VARCHAR(100) NOT NULL,
                    target_id INT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id 
                ON public.admin_logs(admin_id);
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_admin_logs_target_type 
                ON public.admin_logs(target_type);
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp 
                ON public.admin_logs(timestamp);
            """))
            print("✓ AdminLogs table created successfully")

            conn.commit()

        print("\n" + "="*60)
        print("✓ All migrations completed successfully!")
        print("="*60)

    except Exception as e:
        print(f"\n✗ Error during migration: {e}")
        raise
    finally:
        engine.dispose()


if __name__ == "__main__":
    migrate_all()
