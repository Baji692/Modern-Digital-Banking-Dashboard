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


def auto_categorize(
    description: str,
    merchant: Optional[str],
    txn_type: str,
) -> str:
    text = f"{description or ''} {merchant or ''}".lower()

    if txn_type.lower() == "credit":
        return "Income"

    # Priority rules
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
    account_id: Optional[int] = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Transactions)
        .join(Accounts)
        .filter(Accounts.user_id == current_user.id)
    )

    if account_id:
        query = query.filter(Transactions.account_id == account_id)

    transactions = (
        query.order_by(Transactions.txn_date.desc())
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
    # 1. Verify Account
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

    # 2. Read Content
    try:
        content = file.file.read().decode("utf-8-sig")
        if not content.strip():
            raise ValueError("CSV file is empty")
            
        reader = csv.DictReader(io.StringIO(content))
        
        # Normalize column names (strip spaces and lowercase)
        if reader.fieldnames:
            reader.fieldnames = [f.strip().lower() for f in reader.fieldnames]
        else:
            raise ValueError("CSV file has no header row")

        required_columns = {"txn_date", "description", "amount", "txn_type"}
        missing = required_columns - set(reader.fieldnames)
        if missing:
            raise ValueError(f"Missing required columns: {', '.join(missing)}")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV: {str(e)}")

    # 3. Process Rows
    transactions_to_insert = []
    total_amount_change = Decimal("0.00")

    for row_number, raw_row in enumerate(reader, start=2):
        # Clean row data
        row = {k: v.strip() for k, v in raw_row.items() if k and v is not None}
        
        if not row.get("description") or not row.get("amount") or not row.get("txn_date"):
            continue # Skip empty rows

        try:
            # Parse Date
            txn_date = None
            date_str = row["txn_date"]
            datetime_formats = [
                "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M",
                "%d-%m-%Y %H:%M:%S", "%d-%m-%Y %H:%M",
                "%Y-%m-%d", "%d-%m-%Y",
                "%m/%d/%Y", "%m/%d/%Y %H:%M"
            ]

            for fmt in datetime_formats:
                try:
                    txn_date = datetime.strptime(date_str, fmt)
                    break
                except ValueError:
                    continue

            if txn_date is None:
                raise ValueError(f"Invalid date format: {date_str}")

            if txn_date.time() == time.min:
                txn_date = datetime.combine(txn_date.date(), time(12, 0))

            # Parse Amount
            try:
                amount_str = row["amount"].replace(",", "").replace("₹", "").strip()
                amount = Decimal(amount_str)
            except:
                raise ValueError(f"Invalid amount: {row['amount']}")

            # Parse Type
            txn_type = row["txn_type"].lower().strip()
            if txn_type not in {"debit", "credit"}:
                raise ValueError(f"Invalid txn_type: {txn_type}. Must be 'debit' or 'credit'")

            merchant = row.get("merchant") or None
            category = auto_categorize(
                description=row["description"],
                merchant=merchant,
                txn_type=txn_type,
            )

            # Create Object
            txn = Transactions(
                account_id=account_id,
                description=row["description"],
                merchant=merchant,
                category=category,
                amount=amount,
                currency=row.get("currency", "INR"),
                txn_type=txn_type,
                status="posted",
                txn_date=txn_date,
            )
            
            transactions_to_insert.append(txn)
            
            # Track balance update
            if txn_type == "debit":
                total_amount_change -= amount
            else:
                total_amount_change += amount

        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Row {row_number} error: {str(e)}",
            )

    # 4. Save and Update Balance
    if transactions_to_insert:
        try:
            # Add all transactions
            for t in transactions_to_insert:
                db.add(t)
            
            # Update account balance
            account.balance = (account.balance or Decimal("0.00")) + total_amount_change
            
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return {
        "message": f"Successfully imported {len(transactions_to_insert)} transactions",
        "inserted": len(transactions_to_insert),
    }
