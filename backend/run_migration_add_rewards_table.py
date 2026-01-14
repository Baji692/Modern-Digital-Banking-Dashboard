#!/usr/bin/env python3
"""
Migration: Add Rewards Table
Creates the rewards table to store user reward program information
"""

import psycopg2
import psycopg2.extras
from database import get_db_connection


def migrate_add_rewards_table():
    """Create rewards table"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Create rewards table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS public.rewards (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
                program_name VARCHAR(100) NOT NULL,
                points_balance INT DEFAULT 0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Create index on user_id for faster queries
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_rewards_user_id 
            ON public.rewards(user_id);
        """)

        conn.commit()
        print("✓ Rewards table created successfully")

    except Exception as e:
        conn.rollback()
        print(f"✗ Error creating rewards table: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    migrate_add_rewards_table()
