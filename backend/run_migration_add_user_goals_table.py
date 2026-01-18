"""
Migration script to add UserGoals table for storing user financial goals
"""
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:admin123@localhost/BankDashboard"


def run_migration():
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        # Create UserGoals table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_goals (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL UNIQUE,
                savings_goal FLOAT DEFAULT 20.0,
                spending_goal FLOAT DEFAULT 100000.0,
                bills_goal FLOAT DEFAULT 100.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """))

        conn.commit()
        print("✓ UserGoals table created successfully")


if __name__ == "__main__":
    run_migration()
