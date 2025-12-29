from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Accounts
from dependencies import get_current_user
from schemas import AccountCreate, AccountUpdate

router = APIRouter(prefix="/accounts", tags=["Accounts"])


# ============================
# READ
# ============================
@router.get("/")
def get_accounts(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    accounts = (
        db.query(Accounts)
        .filter(Accounts.user_id == current_user.id)
        .order_by(Accounts.is_primary.desc())
        .all()
    )

    return [
        {
            "id": a.id,
            "bank_name": a.bank_name,
            "account_type": a.account_type,
            "masked_account": a.masked_account,
            "balance": float(a.balance),
            "currency": a.currency,
            "is_primary": a.is_primary,
        }
        for a in accounts
    ]


# ============================
# CREATE
# ============================
@router.post("/")
def create_account(
    data: AccountCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account_type = data.account_type.lower()

    if account_type not in ["savings", "current", "credit"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid account type"
        )

    account = Accounts(
        user_id=current_user.id,
        bank_name=data.bank_name,
        account_type=account_type,
        masked_account=data.masked_account,
        currency=data.currency or "INR",
        balance=data.balance or 0,
        is_primary=data.is_primary or False,
    )

    db.add(account)
    db.commit()
    db.refresh(account)

    return {
        "id": account.id,
        "bank_name": account.bank_name,
        "account_type": account.account_type,
        "balance": float(account.balance),
        "currency": account.currency,
        "is_primary": account.is_primary,
    }


# ============================
# UPDATE
# ============================
@router.put("/{account_id}")
def update_account(
    account_id: int,
    data: AccountUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
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
        raise HTTPException(404, "Account not found")

    update_data = data.dict(exclude_unset=True)

    # Whitelist fields
    allowed_fields = {
        "bank_name",
        "account_type",
        "masked_account",
        "balance",
        "is_primary",
    }

    for key, value in update_data.items():
        if key in allowed_fields:
            if key == "account_type":
                value = value.lower()
            setattr(account, key, value)

    db.commit()
    db.refresh(account)

    return {
        "id": account.id,
        "bank_name": account.bank_name,
        "account_type": account.account_type,
        "balance": float(account.balance),
        "currency": account.currency,
        "is_primary": account.is_primary,
    }


# ============================
# DELETE
# ============================
@router.delete("/{account_id}")
def delete_account(
    account_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
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
        raise HTTPException(404, "Account not found")

    db.delete(account)
    db.commit()

    return {"message": "Account deleted successfully"}
