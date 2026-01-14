#!/usr/bin/env python3
"""
Migration: Add AdminLogs Table
Creates the admin_logs table for tracking admin actions and audit trail
"""

import psycopg2
import psycopg2.extras
from database import get_db_connection


def migrate_add_admin_logs_table():
    """Create admin_logs table"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Create admin_logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS public.admin_logs (
                id SERIAL PRIMARY KEY,
                admin_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
                action TEXT NOT NULL,
                target_type VARCHAR(100) NOT NULL,
                target_id INT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Create index on admin_id for faster queries
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id 
            ON public.admin_logs(admin_id);
        """)

        # Create index on target_type for filtering logs
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_admin_logs_target_type 
            ON public.admin_logs(target_type);
        """)

        # Create index on timestamp for sorting logs
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp 
            ON public.admin_logs(timestamp);
        """)

        conn.commit()
        print("✓ AdminLogs table created successfully")

    except Exception as e:
        conn.rollback()
        print(f"✗ Error creating admin_logs table: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    migrate_add_admin_logs_table()
