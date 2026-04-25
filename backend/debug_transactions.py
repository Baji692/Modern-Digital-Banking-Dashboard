from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Transactions, Accounts
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finbank.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

print("--- Transactions Summary ---")
txn_count = db.query(Transactions).count()
print(f"Total Transactions: {txn_count}")

print("\n--- Latest 10 Transactions ---")
latest_txns = db.query(Transactions).order_by(Transactions.id.desc()).limit(10).all()
for t in latest_txns:
    # Try to get bank name
    acc = db.query(Accounts).filter(Accounts.id == t.account_id).first()
    bank_name = acc.bank_name if acc else "UNKNOWN"
    print(f"ID: {t.id} | Acc ID: {t.account_id} ({bank_name}) | Desc: {t.description} | Amount: {t.amount} | Date: {t.txn_date}")

print("\n--- Accounts ---")
accounts = db.query(Accounts).all()
for a in accounts:
    print(f"ID: {a.id} | Bank: {a.bank_name} | User ID: {a.user_id} | Balance: {a.balance}")

db.close()
