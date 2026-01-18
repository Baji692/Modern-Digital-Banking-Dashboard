"""
Migration script to add CustomGoals table for storing user-defined financial goals
"""
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:admin123@localhost/BankDashboard"


def run_migration():
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        # Create CustomGoals table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS custom_goals (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name VARCHAR(100) NOT NULL,
                description VARCHAR(500),
                goal_type VARCHAR(20) NOT NULL,
                target_value NUMERIC(12, 2) NOT NULL,
                current_value NUMERIC(12, 2) DEFAULT 0,
                category VARCHAR(50) NOT NULL,
                target_date DATE,
                priority VARCHAR(20) DEFAULT 'medium',
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """))

        conn.commit()
        print("✓ CustomGoals table created successfully")


if __name__ == "__main__":
    run_migration()
