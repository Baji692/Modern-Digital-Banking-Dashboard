from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Transactions, Accounts
from dependencies import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("/recent")
def recent_transactions(
    current_user = Depends(get_current_user),
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
