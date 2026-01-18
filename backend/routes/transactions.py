from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
import csv
import io
from datetime import datetime, date, time
from decimal import Decimal
from services.transaction_utils import auto_categorize

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


# def auto_categorize(
#     description: str,
#     merchant: Optional[str],
#     txn_type: str,
# ) -> str:
#     text = f"{description or ''} {merchant or ''}".lower()

#     if txn_type.lower() == "credit":
#         return "Income"

#     for category, keywords in CATEGORY_RULES.items():
#         for word in keywords:
#             if word in text:
#                 return category

#     return "Uncategorized"


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
            Accounts.user_id == current_user.id,
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

    # BALANCE SYNC
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
            Accounts.user_id == current_user.id,
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
# CSV IMPORT (CRASH-SAFE)
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
            Accounts.user_id == current_user.id,
        )
        .first()
    )

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400, detail="Only CSV files are allowed")

    content = file.file.read().decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(content))

    required_columns = {"txn_date", "description", "amount", "txn_type"}
    missing = required_columns - set(reader.fieldnames or [])
    if missing:
        raise HTTPException(
            status_code=400, detail=f"Missing columns: {missing}")

    transactions_to_insert = []

    for row_number, row in enumerate(reader, start=2):
        row = {k.strip(): v.strip() for k, v in row.items() if k and v}

        try:
            # Try to parse datetime with time first, then fall back to date only
            txn_date = None
            date_str = row["txn_date"]

            # Try multiple datetime formats
            datetime_formats = [
                "%Y-%m-%d %H:%M:%S",      # 2026-01-13 14:30:45
                "%Y-%m-%d %H:%M",         # 2026-01-13 14:30
                "%d-%m-%Y %H:%M:%S",      # 13-01-2026 14:30:45
                "%d-%m-%Y %H:%M",         # 13-01-2026 14:30
                "%Y-%m-%d",               # 2026-01-13 (date only)
                "%d-%m-%Y",               # 13-01-2026 (date only)
            ]

            for fmt in datetime_formats:
                try:
                    txn_date = datetime.strptime(date_str, fmt)
                    break
                except ValueError:
                    continue

            if txn_date is None:
                raise ValueError(
                    f"Unable to parse date: {date_str}. Use format: YYYY-MM-DD or YYYY-MM-DD HH:MM:SS")

            # If only date was provided (no time), set to noon to distinguish from default 00:00:00
            if txn_date.time() == time.min:
                txn_date = datetime.combine(
                    txn_date.date(), time(hour=12, minute=0))

            amount = Decimal(row["amount"])
            txn_type = row["txn_type"].lower()

            if txn_type not in {"debit", "credit"}:
                raise ValueError("Invalid txn_type")

            merchant = row.get("merchant") or None

            category = auto_categorize(
                description=row["description"],
                merchant=merchant,
                txn_type=txn_type,
            )

            # ✅ SAFE BALANCE UPDATE
            if txn_type == "debit":
                account.balance = (account.balance or Decimal("0.00")) - amount
            else:
                account.balance = (account.balance or Decimal("0.00")) + amount

            transactions_to_insert.append(
                Transactions(
                    account_id=account_id,
                    description=row["description"],
                    merchant=merchant,
                    category=category,
                    amount=amount,
                    currency="INR",
                    txn_type=txn_type,
                    status="posted",
                    txn_date=txn_date,
                )
            )

        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Row {row_number} error: {str(e)} | Data: {row}",
            )

    db.bulk_save_objects(transactions_to_insert)
    db.commit()

    return {
        "message": "CSV imported successfully",
        "inserted": len(transactions_to_insert),
    }
