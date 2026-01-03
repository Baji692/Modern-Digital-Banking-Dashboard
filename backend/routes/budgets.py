from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Budgets
from schemas import BudgetCreate, BudgetUpdate
from auth import get_current_user
from services.budget_service import calculate_spent_amount

router = APIRouter(prefix="/budgets", tags=["Budgets"])


# =====================================================
# GET ALL BUDGETS (AUTO-CALCULATED)
# =====================================================
@router.get("/")
def get_budgets(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budgets = (
        db.query(Budgets)
        .filter(Budgets.user_id == current_user.id)
        .all()
    )

    # 🔥 AUTO-CALCULATE spent_amount
    for budget in budgets:
        budget.spent_amount = calculate_spent_amount(
            db=db,
            user_id=current_user.id,
            category=budget.category,
            month=budget.month,
            year=budget.year,
        )

    return budgets


# =====================================================
# CREATE BUDGET
# =====================================================
@router.post("/")
def create_budget(
    data: BudgetCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Budgets)
        .filter(
            Budgets.user_id == current_user.id,
            Budgets.category == data.category,
            Budgets.month == data.month,
            Budgets.year == data.year,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Budget already exists for this category and month",
        )

    budget = Budgets(
        user_id=current_user.id,
        category=data.category,
        limit_amount=data.limit_amount,
        spent_amount=0.00,  # calculated dynamically
        month=data.month,
        year=data.year,
    )

    db.add(budget)
    db.commit()
    db.refresh(budget)

    return {"message": "Budget created successfully"}


# =====================================================
# UPDATE BUDGET (ONLY LIMIT)
# =====================================================
@router.put("/{budget_id}")
def update_budget(
    budget_id: int,
    data: BudgetUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = (
        db.query(Budgets)
        .filter(
            Budgets.id == budget_id,
            Budgets.user_id == current_user.id,
        )
        .first()
    )

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    if data.limit_amount is not None:
        budget.limit_amount = data.limit_amount

    db.commit()

    return {"message": "Budget updated successfully"}


# =====================================================
# DELETE BUDGET
# =====================================================
@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = (
        db.query(Budgets)
        .filter(
            Budgets.id == budget_id,
            Budgets.user_id == current_user.id,
        )
        .first()
    )

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    db.delete(budget)
    db.commit()

    return {"message": "Budget deleted successfully"}
