from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Budgets
from dependencies import get_current_user
from schemas import BudgetCreate, BudgetUpdate
from services.budget_service import calculate_spent_amount

router = APIRouter(prefix="/budgets", tags=["Budgets"])


@router.get("/", response_model=List[dict])
def get_budgets(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budgets = (
        db.query(Budgets)
        .filter(Budgets.user_id == current_user.id)
        .order_by(Budgets.month.asc(), Budgets.year.asc())
        .all()
    )

    out = []
    for b in budgets:
        spent = calculate_spent_amount(
            db, current_user.id, b.category, b.month, b.year)
        out.append({
            "id": b.id,
            "category": b.category,
            "limit_amount": float(b.limit_amount),
            "spent_amount": float(spent),
            "month": b.month,
            "year": b.year,
        })

    return out


@router.post("/")
def create_budget(
    data: BudgetCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = Budgets(
        user_id=current_user.id,
        category=data.category,
        limit_amount=data.limit_amount,
        month=data.month,
        year=data.year,
    )

    db.add(budget)
    db.commit()
    db.refresh(budget)

    return {
        "id": budget.id,
        "category": budget.category,
        "limit_amount": float(budget.limit_amount),
        "spent_amount": float(0),
        "month": budget.month,
        "year": budget.year,
    }


@router.put("/{budget_id}")
def update_budget(
    budget_id: int,
    data: BudgetUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = (
        db.query(Budgets)
        .filter(Budgets.id == budget_id, Budgets.user_id == current_user.id)
        .first()
    )

    if not budget:
        raise HTTPException(404, "Budget not found")

    update_data = data.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(budget, key, value)

    db.commit()
    db.refresh(budget)

    spent = calculate_spent_amount(
        db, current_user.id, budget.category, budget.month, budget.year)

    return {
        "id": budget.id,
        "category": budget.category,
        "limit_amount": float(budget.limit_amount),
        "spent_amount": float(spent),
        "month": budget.month,
        "year": budget.year,
    }


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = (
        db.query(Budgets)
        .filter(Budgets.id == budget_id, Budgets.user_id == current_user.id)
        .first()
    )

    if not budget:
        raise HTTPException(404, "Budget not found")

    db.delete(budget)
    db.commit()

    return {"message": "Budget deleted successfully"}
