import logging
from models import Accounts, Transactions, User
from datetime import datetime, time
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.transaction_utils import auto_categorize
from email_service import send_bill_reminder_email

from database import get_db
from models import Bills
from dependencies import get_current_user
from schemas import BillCreate, BillUpdate

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
# PAY BILL
# ============================


@router.post("/{bill_id}/pay")
def pay_bill(
    bill_id: int,
    account_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        bill = (
            db.query(Bills)
            .filter(
                Bills.id == bill_id,
                Bills.user_id == current_user.id,
                Bills.status != "paid",
            )
            .first()
        )

        if not bill:
            raise HTTPException(404, "Bill not found or already paid")

        account = (
            db.query(Accounts)
            .filter(
                Accounts.id == account_id,
                Accounts.user_id == current_user.id,
            )
            .first()
        )

        if not account:
            raise HTTPException(404, "Account not found")

        amount = Decimal(str(bill.amount_due))

        if account.balance < amount:
            raise HTTPException(
                status_code=400,
                detail="Insufficient balance to pay this bill",
            )

        category = auto_categorize(
            description=bill.biller_name,
            merchant=bill.biller_name,
            txn_type="debit",
        )

        transaction = Transactions(
            account_id=account.id,
            description=f"Bill Payment – {bill.biller_name}",
            merchant=bill.biller_name,
            category=category,
            amount=amount,
            currency=account.currency,
            txn_type="debit",
            status="posted",
            txn_date=datetime.combine(datetime.today().date(), time.min),
        )

        account.balance = account.balance - amount
        bill.status = "paid"
        bill.paid_date = datetime.now()

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        masked = f"*****{str(account.masked_account)[-4:]}"
        return {
            "message": f"{bill.biller_name} paid from {account.bank_name} ({masked})",
            "transaction_id": transaction.id,
        }

    except HTTPException:
        raise
    except Exception:
        logging.exception("Error while processing bill payment")
        raise HTTPException(
            status_code=500, detail="Internal server error while paying bill")


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
# SEND REMINDER EMAIL
# ============================
@router.post("/{bill_id}/remind")
def send_bill_reminder(
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

    user = (
        db.query(User)
        .filter(User.id == current_user.id)
        .first()
    )

    if not user or not user.email:
        raise HTTPException(400, "User email not found")

    try:
        due_date_str = bill.due_date.strftime("%d %B %Y")
        send_bill_reminder_email(
            to_email=user.email,
            bill_name=bill.biller_name,
            amount=str(bill.amount_due),
            due_date=due_date_str
        )
        return {"message": "Reminder email sent successfully"}
    except Exception as e:
        logging.exception("Error sending bill reminder email")
        raise HTTPException(
            status_code=500,
            detail="Failed to send reminder email"
        )
