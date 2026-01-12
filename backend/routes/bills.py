from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal

from database import get_db
from models import Bills, Accounts, Transactions
from dependencies import get_current_user
from schemas import BillCreate, BillUpdate
from routes.transactions import auto_categorize

router = APIRouter(prefix="/bills", tags=["Bills"])


# ============================
# READ UPCOMING (UNPAID)
# ============================
@router.get("/upcoming")
def upcoming_bills(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bills = (
        db.query(Bills)
        .filter(
            Bills.user_id == current_user.id,
            Bills.status != "paid"
        )
        .order_by(Bills.due_date.asc())
        .all()
    )

    return [
        {
            "id": b.id,
            "biller_name": b.biller_name,
            "amount_due": float(b.amount_due),
            "due_date": b.due_date,
            "status": b.status,
            "auto_pay": b.auto_pay,
        }
        for b in bills
    ]


# ============================
# READ ALL (PAID + UNPAID)
# ============================
@router.get("/")
def get_all_bills(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(Bills)
        .filter(Bills.user_id == current_user.id)
        .order_by(Bills.due_date.asc())
        .all()
    )


# ============================
# CREATE
# ============================
@router.post("/")
def create_bill(
    data: BillCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bill = Bills(
        user_id=current_user.id,
        biller_name=data.biller_name,
        amount_due=data.amount_due,
        due_date=data.due_date,
        status="upcoming"
    )
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill


# ============================
# UPDATE
# ============================
@router.put("/{bill_id}")
def update_bill(
    bill_id: int,
    data: BillUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bill = (
        db.query(Bills)
        .filter(
            Bills.id == bill_id,
            Bills.user_id == current_user.id
        )
        .first()
    )

    if not bill:
        raise HTTPException(404, "Bill not found")

    update_data = data.dict(exclude_unset=True)

    allowed_fields = {
        "biller_name",
        "amount_due",
        "due_date",
        "status",
        "auto_pay",
    }

    for key, value in update_data.items():
        if key in allowed_fields:
            setattr(bill, key, value)

    db.commit()
    db.refresh(bill)

    return {
        "id": bill.id,
        "biller_name": bill.biller_name,
        "amount_due": float(bill.amount_due),
        "due_date": bill.due_date,
        "status": bill.status,
        "auto_pay": bill.auto_pay,
    }


# ============================
# DELETE
# ============================
@router.delete("/{bill_id}")
def delete_bill(
    bill_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bill = (
        db.query(Bills)
        .filter(
            Bills.id == bill_id,
            Bills.user_id == current_user.id
        )
        .first()
    )

    if not bill:
        raise HTTPException(404, "Bill not found")

    db.delete(bill)
    db.commit()

    return {"message": "Bill deleted successfully"}


# ============================
# PAY BILL (WITH ACCOUNT SELECTION)
# ============================
@router.post("/{bill_id}/pay")
def pay_bill(
    bill_id: int,
    account_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify bill exists and belongs to user
    bill = (
        db.query(Bills)
        .filter(
            Bills.id == bill_id,
            Bills.user_id == current_user.id
        )
        .first()
    )

    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    if bill.status == "paid":
        raise HTTPException(status_code=400, detail="Bill already paid")

    # Verify account exists and belongs to user
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

    # Check if account has sufficient balance
    bill_amount = Decimal(str(bill.amount_due))
    if account.balance < bill_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. Required: ₹{bill_amount}, Available: ₹{account.balance}"
        )

    # Deduct amount from account balance
    account.balance -= bill_amount

    # Auto-categorize based on biller name
    category = auto_categorize(
        description=f"Bill Payment - {bill.biller_name}",
        merchant=bill.biller_name,
        txn_type="debit"
    )

    # Create transaction record
    transaction = Transactions(
        account_id=account_id,
        bill_id=bill_id,  # ✅ Link transaction to bill
        description=f"Bill Payment - {bill.biller_name}",
        merchant=bill.biller_name,
        category=category,
        amount=bill_amount,
        currency=account.currency or "INR",
        txn_type="debit",
        status="posted",
        txn_date=datetime.utcnow(),
    )

    # Mark bill as paid
    bill.status = "paid"

    db.add(transaction)
    db.commit()
    db.refresh(bill)

    return {
        "message": "Bill paid successfully",
        "bill_id": bill.id,
        "transaction_id": transaction.id,
        "amount": float(bill_amount),
        "new_balance": float(account.balance),
    }
