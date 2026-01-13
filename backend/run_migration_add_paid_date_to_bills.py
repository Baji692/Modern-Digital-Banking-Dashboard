"""
Migration script to add paid_date column to bills table
"""
import logging
from sqlalchemy import Column, DateTime, text
from sqlalchemy.orm import Session
from database import engine, Base
from models import Bills

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_migration():
    """Add paid_date column to bills table if it doesn't exist"""
    try:
        with engine.connect() as connection:
            # Check if the column already exists
            result = connection.execute(
                text(
                    """
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'bills' AND column_name = 'paid_date'
                    """
                )
            )

            if result.fetchone():
                logger.info("Column 'paid_date' already exists in bills table")
                return

            # Add the column if it doesn't exist
            connection.execute(
                text(
                    """
                    ALTER TABLE bills 
                    ADD COLUMN paid_date TIMESTAMP NULL
                    """
                )
            )
            connection.commit()
            logger.info("Successfully added 'paid_date' column to bills table")
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        raise


if __name__ == "__main__":
    run_migration()
