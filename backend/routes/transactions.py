from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
import csv
import io
from datetime import datetime

from database import get_db
from models import Transactions, Accounts
from dependencies import get_current_user
from schemas import TransactionCreate, TransactionUpdate

router = APIRouter(prefix="/transactions", tags=["Transactions"])


# =========================================================
# AUTO CATEGORY RULES
# =========================================================

CATEGORY_RULES = {
    "Food": ["grocery", "restaurant", "hotel", "food", "whole foods", "swiggy", "zomato"],
    "Utilities": ["electric", "electricity", "power", "water", "gas", "internet", "bsnl"],
    "Income": ["salary", "payroll", "credit"],
    "Shopping": ["amazon", "flipkart", "mall"],
    "Transport": ["uber", "ola", "fuel", "petrol"],
}


def auto_categorize(
    description: str,
    merchant: Optional[str],
    txn_type: str
) -> str:
    text = f"{description or ''} {merchant or ''}".lower()

    if txn_type.lower() == "credit":
        return "Income"

    for category, keywords in CATEGORY_RULES.items():
        for word in keywords:
            if word in text:
                return category

    return "Uncategorized"


# =========================================================
# GET ALL TRANSACTIONS
# =========================================================

@router.get("/")
def get_all_transactions(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transactions = (
        db.query(Transactions)
        .join(Accounts)
        .filter(Accounts.user_id == current_user.id)
        .order_by(Transactions.txn_date.desc())
        .all()
    )

    return [
        {
            "id": t.id,
            "account_id": t.account_id,
            "description": t.description,
            "category": t.category,
            "merchant": t.merchant,
            "amount": float(t.amount),
            "currency": t.currency,
            "txn_type": t.txn_type,
            "status": t.status,
            "txn_date": t.txn_date,
        }
        for t in transactions
    ]


# =========================================================
# RECENT TRANSACTIONS
# =========================================================

@router.get("/recent")
def recent_transactions(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transactions = (
        db.query(Transactions)
        .join(Accounts)
        .filter(Accounts.user_id == current_user.id)
        .order_by(Transactions.txn_date.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "id": t.id,
            "account_id": t.account_id,
            "bank_name": t.account.bank_name,
            "description": t.description,
            "category": t.category,
            "merchant": t.merchant,
            "amount": float(t.amount),
            "currency": t.currency,
            "txn_type": t.txn_type,
            "status": t.status,
            "txn_date": t.txn_date,
        }
        for t in transactions
    ]


# =========================================================
# CREATE SINGLE TRANSACTION
# =========================================================

@router.post("/")
def create_transaction(
    data: TransactionCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account = (
        db.query(Accounts)
        .filter(
            Accounts.id == data.account_id,
            Accounts.user_id == current_user.id
        )
        .first()
    )

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    category = auto_categorize(
        description=data.description,
        merchant=data.merchant,
        txn_type=data.txn_type,
    )

    transaction = Transactions(
        account_id=data.account_id,
        description=data.description,
        merchant=data.merchant,
        category=category,
        amount=data.amount,
        currency=data.currency,
        txn_type=data.txn_type,
        status="posted",
        txn_date=data.txn_date,
    )

    # ✅ BALANCE SYNC (MISSING EARLIER)
    if data.txn_type.lower() == "debit":
        account.balance -= data.amount
    else:
        account.balance += data.amount

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return {"message": "Transaction created successfully"}


# =========================================================
# UPDATE TRANSACTION
# =========================================================

@router.put("/{txn_id}")
def update_transaction(
    txn_id: int,
    data: TransactionUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transaction = (
        db.query(Transactions)
        .join(Accounts)
        .filter(
            Transactions.id == txn_id,
            Accounts.user_id == current_user.id
        )
        .first()
    )

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(transaction, key, value)

    db.commit()
    db.refresh(transaction)

    return {"message": "Transaction updated successfully"}


# =========================================================
# CSV IMPORT (MILESTONE 1 ⭐)
# =========================================================

@router.post("/import-csv")
def import_transactions_csv(
    account_id: int,
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account = (
        db.query(Accounts)
        .filter(
            Accounts.id == account_id,
            Accounts.user_id == current_user.id
        )
        .first()
    )

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))

    required_columns = {"txn_date", "description", "merchant", "amount", "txn_type"}
    if not required_columns.issubset(reader.fieldnames):
        raise HTTPException(
            status_code=400,
            detail=f"CSV must contain columns: {required_columns}",
        )

    transactions_to_insert = []

    for row in reader:
        try:
            txn_date = datetime.fromisoformat(row["txn_date"])
            amount = float(row["amount"])
            txn_type = row["txn_type"].lower()

            category = auto_categorize(
                description=row["description"],
                merchant=row.get("merchant"),
                txn_type=txn_type,
            )

            # ✅ BALANCE SYNC (CSV)
            if txn_type == "debit":
                account.balance -= amount
            else:
                account.balance += amount

            transactions_to_insert.append(
                Transactions(
                    account_id=account_id,
                    description=row["description"],
                    merchant=row.get("merchant"),
                    category=category,
                    amount=amount,
                    currency="INR",
                    txn_type=txn_type,
                    status="posted",
                    txn_date=txn_date,
                )
            )
        except Exception:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid row data: {row}",
            )

    db.bulk_save_objects(transactions_to_insert)
    db.commit()

    return {
        "message": "CSV imported successfully",
        "inserted": len(transactions_to_insert),
    }
