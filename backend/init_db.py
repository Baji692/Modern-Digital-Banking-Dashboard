import os
from database import engine, Base
import models  # Import models to register them with Base

def init_db():
    print("Connecting to database...")
    try:
        # This will create all tables defined in models.py if they don't exist
        Base.metadata.create_all(bind=engine)
        print("SUCCESS: All tables created successfully!")
    except Exception as e:
        print(f"ERROR creating tables: {e}")

if __name__ == "__main__":
    init_db()
