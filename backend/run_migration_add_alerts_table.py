#!/usr/bin/env python3
"""
Migration: Add Alerts Table
Creates the alerts table to store user notifications and alerts
"""

import psycopg2
import psycopg2.extras
from database import get_db_connection


def migrate_add_alerts_table():
    """Create alerts table"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Create alerts table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS public.alerts (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Create index on user_id for faster queries
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_alerts_user_id 
            ON public.alerts(user_id);
        """)

        # Create index on type for filtering alerts
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_alerts_type 
            ON public.alerts(type);
        """)

        conn.commit()
        print("✓ Alerts table created successfully")

    except Exception as e:
        conn.rollback()
        print(f"✗ Error creating alerts table: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    migrate_add_alerts_table()
