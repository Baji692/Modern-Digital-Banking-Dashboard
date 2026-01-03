from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "postgresql://postgres:admin123@localhost/BankDashboard"

engine = create_engine(
    DATABASE_URL,
    echo=False  # set True only if you want SQL logs
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# ✅ REQUIRED BY FASTAPI ROUTES
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
