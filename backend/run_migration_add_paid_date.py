"""
Run this script to add the nullable `paid_date` column to the `bills` table.
Usage:
  python run_migration_add_paid_date.py

It uses the same SQLAlchemy `engine` configured in `database.py`.
"""
from sqlalchemy import text
from database import engine

SQL = """
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS paid_date TIMESTAMP NULL;
"""

if __name__ == "__main__":
    try:
        with engine.connect() as conn:
            conn.execute(text(SQL))
            conn.commit()
        print("Migration applied: paid_date column added (or already exists).")
    except Exception as e:
        print("Error applying migration:", e)
        raise
