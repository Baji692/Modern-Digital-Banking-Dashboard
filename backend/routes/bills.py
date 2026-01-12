from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

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
