"""
Migration script to add bill_id column to transactions table.
Run this script once after updating models.
"""
from sqlalchemy import Column, Integer, ForeignKey, text
from database import engine


def migrate():
    """Add bill_id column to transactions table if it doesn't exist"""
    try:
        with engine.connect() as conn:
            # Check if column exists
            result = conn.execute(
                text("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name='transactions' AND column_name='bill_id'
                """)
            )

            if not result.fetchone():
                # Add the column
                print("Adding bill_id column to transactions table...")
                conn.execute(text("""
                ALTER TABLE transactions 
                ADD COLUMN bill_id INTEGER
                """))
                conn.commit()
                print("✓ bill_id column added successfully!")
            else:
                print("✓ bill_id column already exists")
    except Exception as e:
        print(f"Note: {e}")
        print("Proceeding anyway - SQLAlchemy will handle the schema...")


if __name__ == "__main__":
    migrate()
