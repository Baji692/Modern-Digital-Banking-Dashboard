import requests

BASE_URL = "http://127.0.0.1:8000"

# Note: We need a valid token. Since I can't easily get one without login,
# I'll just check the database again, but this time I'll count how many 
# transactions belong to the user according to the SAME query the API uses.

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Transactions, Accounts, User
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finbank.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

user = db.query(User).filter(User.email == "bajibabu692@gmail.com").first()
if not user:
    print("User not found")
else:
    print(f"Checking transactions for User: {user.name} (ID: {user.id})")
    
    # This is the exact query from the API
    transactions = (
        db.query(Transactions)
        .join(Accounts)
        .filter(Accounts.user_id == user.id)
        .all()
    )
    
    print(f"Query returned {len(transactions)} transactions")
    for t in transactions[:5]:
        print(f"ID: {t.id}, Date: {t.txn_date}, Desc: {t.description}")

db.close()
