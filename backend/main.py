from fastapi import FastAPI, UploadFile, File, HTTPException
from typing import List
from datetime import datetime
import csv
import io

from models import User, Account, Transaction, TxnType
from mock_data import users, accounts, transactions

app = FastAPI(title="Modern Digital Banking Dashboard API")


# --------------------
# USERS
# --------------------
@app.get("/users", response_model=List[User])
def get_users():
    return users


# --------------------
# ACCOUNTS CRUD
# --------------------
@app.get("/accounts/{user_id}", response_model=List[Account])
def get_accounts(user_id: int):
    return [a for a in accounts if a.user_id == user_id]


@app.post("/accounts", response_model=Account)
def create_account(account: Account):
    accounts.append(account)
    return account


@app.delete("/accounts/{account_id}")
def delete_account(account_id: int):
    global accounts
    accounts = [a for a in accounts if a.id != account_id]
    return {"message": "Account deleted"}


# --------------------
# TRANSACTIONS CRUD
# --------------------
@app.get("/transactions/{user_id}", response_model=List[Transaction])
def get_transactions(user_id: int):
    user_accounts = [a.id for a in accounts if a.user_id == user_id]
    return [t for t in transactions if t.account_id in user_accounts]


@app.post("/transactions", response_model=Transaction)
def create_transaction(txn: Transaction):
    transactions.append(txn)
    return txn


# --------------------
# CSV UPLOAD
# --------------------
@app.post("/upload-csv")
def upload_csv(account_id: int, file: UploadFile = File(...)):
    if not any(a.id == account_id for a in accounts):
        raise HTTPException(status_code=404, detail="Account not found")

    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))

    for row in reader:
        transactions.append(
            Transaction(
                id=len(transactions) + 1,
                account_id=account_id,
                description=row["description"],
                category=row["category"],
                amount=float(row["amount"]),
                currency=row["currency"],
                txn_type=TxnType(row["txn_type"]),
                merchant=row["merchant"],
                txn_date=datetime.fromisoformat(row["txn_date"]),
                posted_date=datetime.fromisoformat(row["posted_date"]),
            )
        )

    return {"message": "CSV uploaded successfully", "count": len(transactions)}
