"""
Enhanced Budget Routes - New API endpoints for budget enhancements
- Budget Insights Summary
- Budget Alerts System  
- Budget Recommendations
- Budget History
- Custom Categories
- Subcategories
- Export functionality
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal

from database import get_db
from models import (
    Budgets, Transactions, BudgetHistory, BudgetRecommendation,
    CustomBudgetCategory, BudgetSubcategory, BudgetAlert, Accounts
)
from dependencies import get_current_user
from schemas import (
    BudgetHistoryOut, BudgetRecommendationOut, CustomBudgetCategoryOut,
    BudgetSubcategoryOut, BudgetAlertOut
)

router = APIRouter(prefix="/budgets-enhanced", tags=["Budgets Enhanced"])


# ============ BUDGET INSIGHTS SUMMARY ============


@router.get("/insights/{month}/{year}")
def get_budget_insights_summary(
    month: int,
    year: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get comprehensive budget summary for a month:
    - Total budget across all categories
    - Total spent
    - Remaining amount
    - Overall % used
    - Count of overspent categories
    """
    budgets = (
        db.query(Budgets)
        .filter(
            Budgets.user_id == current_user.id,
            Budgets.month == month,
            Budgets.year == year,
        )
        .all()
    )

    total_budget = sum(float(b.limit_amount) for b in budgets)
    total_spent = sum(float(b.spent_amount) for b in budgets)
    remaining = total_budget - total_spent
    overall_percent = (total_spent / total_budget *
                       100) if total_budget > 0 else 0

    # Count overspent categories
    overspent_count = sum(1 for b in budgets if float(
        b.spent_amount) > float(b.limit_amount))

    return {
        "total_budget": round(total_budget, 2),
        "total_spent": round(total_spent, 2),
        "remaining_amount": round(remaining, 2),
        "overall_percent_used": round(overall_percent, 2),
        "overspent_categories_count": overspent_count,
        "month": month,
        "year": year,
        "categories_count": len(budgets),
    }


# ============ BUDGET ALERTS ============


@router.get("/alerts/{month}/{year}")
def get_budget_alerts(
    month: int,
    year: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all alerts for the month:
    - Threshold warnings (80%, 90%, 100%)
    - Overspending predictions
    """
    alerts = (
        db.query(BudgetAlert)
        .filter(
            BudgetAlert.user_id == current_user.id,
            BudgetAlert.created_at >= datetime(year, month, 1),
        )
        .order_by(BudgetAlert.created_at.desc())
        .all()
    )

    return [
        {
            "id": a.id,
            "category": a.category,
            "alert_type": a.alert_type,
            "threshold_reached": a.threshold_reached,
            "current_spending": float(a.current_spending),
            "message": a.message,
            "is_read": a.is_read,
            "created_at": a.created_at.isoformat(),
        }
        for a in alerts
    ]


@router.post("/alerts/mark-read/{alert_id}")
def mark_alert_read(
    alert_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark an alert as read"""
    alert = (
        db.query(BudgetAlert)
        .filter(
            BudgetAlert.id == alert_id,
            BudgetAlert.user_id == current_user.id,
        )
        .first()
    )

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_read = True
    db.commit()
    return {"success": True}


# ============ BUDGET RECOMMENDATIONS ============


@router.get("/recommendations/generate/{months_back}")
def generate_budget_recommendations(
    months_back: int = 6,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate AI budget recommendations based on average spending.
    Analyzes last N months of transactions by category.
    """
    recommendations = []

    # Get last N months of transactions
    cutoff_date = datetime.now() - timedelta(days=30 * months_back)

    transactions = (
        db.query(Transactions)
        .join(Accounts, Transactions.account_id == Accounts.id)
        .filter(
            Accounts.user_id == current_user.id,
            Transactions.txn_date >= cutoff_date,
            Transactions.txn_type == "debit",
        )
        .all()
    )

    # Group by category
    category_spending = {}
    for txn in transactions:
        category = txn.category or "Uncategorized"
        if category not in category_spending:
            category_spending[category] = []
        category_spending[category].append(float(txn.amount))

    # Generate recommendations
    for category, amounts in category_spending.items():
        average_spend = sum(amounts) / len(amounts)
        max_spend = max(amounts)

        # Recommend 120% of average (with 20% buffer)
        recommended = average_spend * 1.2

        # Confidence based on consistency
        consistency_ratio = average_spend / max_spend if max_spend > 0 else 1.0
        confidence_score = min(consistency_ratio * 100, 100)

        # Get current budget if exists
        current_budget_obj = (
            db.query(Budgets)
            .filter(
                Budgets.user_id == current_user.id,
                Budgets.category == category,
            )
            .order_by(Budgets.created_at.desc())
            .first()
        )
        current_budget = float(
            current_budget_obj.limit_amount) if current_budget_obj else None

        recommendations.append({
            "category": category,
            "current_budget": current_budget,
            "recommended_budget": round(recommended, 2),
            "average_spend": round(average_spend, 2),
            "confidence_score": round(confidence_score, 2),
            "reasoning": f"Based on {len(amounts)} transactions over {months_back} months. Average: ₹{average_spend:.2f}",
        })

    return recommendations


@router.post("/recommendations/apply/{category}")
def apply_budget_recommendation(
    category: str,
    recommended_amount: float,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Apply a budget recommendation to current month"""
    now = datetime.now()

    # Check if budget already exists for this category this month
    existing = (
        db.query(Budgets)
        .filter(
            Budgets.user_id == current_user.id,
            Budgets.category == category,
            Budgets.month == now.month,
            Budgets.year == now.year,
        )
        .first()
    )

    if existing:
        existing.limit_amount = Decimal(str(recommended_amount))
        db.commit()
        return {"success": True, "message": "Budget updated", "budget_id": existing.id}
    else:
        new_budget = Budgets(
            user_id=current_user.id,
            category=category,
            limit_amount=Decimal(str(recommended_amount)),
            month=now.month,
            year=now.year,
        )
        db.add(new_budget)
        db.commit()
        db.refresh(new_budget)
        return {"success": True, "message": "Budget created", "budget_id": new_budget.id}


# ============ BUDGET HISTORY ============


@router.get("/history/{category}")
def get_budget_history(
    category: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get 6-month history for a category"""
    history = (
        db.query(BudgetHistory)
        .filter(
            BudgetHistory.user_id == current_user.id,
            BudgetHistory.category == category,
        )
        .order_by(BudgetHistory.year.desc(), BudgetHistory.month.desc())
        .limit(6)
        .all()
    )

    return [
        {
            "month": h.month,
            "year": h.year,
            "limit_amount": float(h.limit_amount),
            "spent_amount": float(h.spent_amount),
            "remaining_amount": float(h.remaining_amount),
            "usage_percent": float(h.usage_percent),
        }
        for h in history
    ]


# ============ CUSTOM CATEGORIES ============


@router.get("/custom-categories")
def get_custom_categories(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all custom budget categories for user"""
    categories = (
        db.query(CustomBudgetCategory)
        .filter(
            CustomBudgetCategory.user_id == current_user.id,
            CustomBudgetCategory.is_active == True,
        )
        .all()
    )

    return [
        {
            "id": c.id,
            "category_name": c.category_name,
            "icon_emoji": c.icon_emoji,
            "color_hex": c.color_hex,
        }
        for c in categories
    ]


@router.post("/custom-categories")
def create_custom_category(
    name: str,
    icon: str = "💰",
    color: str = "#2563eb",
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new custom budget category"""
    new_category = CustomBudgetCategory(
        user_id=current_user.id,
        category_name=name,
        icon_emoji=icon,
        color_hex=color,
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return {
        "id": new_category.id,
        "category_name": new_category.category_name,
        "icon_emoji": new_category.icon_emoji,
        "color_hex": new_category.color_hex,
    }


@router.delete("/custom-categories/{category_id}")
def delete_custom_category(
    category_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Soft delete a custom category"""
    category = (
        db.query(CustomBudgetCategory)
        .filter(
            CustomBudgetCategory.id == category_id,
            CustomBudgetCategory.user_id == current_user.id,
        )
        .first()
    )

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    category.is_active = False
    db.commit()
    return {"success": True}


# ============ SUBCATEGORIES ============


@router.get("/subcategories/{parent_category}/{month}/{year}")
def get_subcategories(
    parent_category: str,
    month: int,
    year: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all subcategories for a parent category"""
    subcats = (
        db.query(BudgetSubcategory)
        .filter(
            BudgetSubcategory.user_id == current_user.id,
            BudgetSubcategory.parent_category == parent_category,
            BudgetSubcategory.month == month,
            BudgetSubcategory.year == year,
        )
        .all()
    )

    return [
        {
            "id": s.id,
            "parent_category": s.parent_category,
            "subcategory_name": s.subcategory_name,
            "limit_amount": float(s.limit_amount),
            "spent_amount": float(s.spent_amount),
            "usage_percent": (float(s.spent_amount) / float(s.limit_amount) * 100)
            if float(s.limit_amount) > 0
            else 0,
        }
        for s in subcats
    ]


@router.post("/subcategories")
def create_subcategory(
    parent_category: str,
    subcategory_name: str,
    limit_amount: float,
    month: int,
    year: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new subcategory"""
    new_subcat = BudgetSubcategory(
        user_id=current_user.id,
        parent_category=parent_category,
        subcategory_name=subcategory_name,
        limit_amount=Decimal(str(limit_amount)),
        month=month,
        year=year,
    )

    db.add(new_subcat)
    db.commit()
    db.refresh(new_subcat)

    return {
        "id": new_subcat.id,
        "parent_category": new_subcat.parent_category,
        "subcategory_name": new_subcat.subcategory_name,
        "limit_amount": float(new_subcat.limit_amount),
    }


# ============ TRANSACTION DRILLDOWN ============


@router.get("/transactions/{category}/{month}/{year}")
def get_category_transactions(
    category: str,
    month: int,
    year: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all transactions for a category in a given month"""
    from sqlalchemy import extract
    from services.transaction_utils import auto_categorize

    print(f"\n🔍 DEBUG: Looking for transactions")
    print(f"   User ID: {current_user.id}")
    print(f"   Category: {category}")
    print(f"   Month: {month}, Year: {year}")

    # Debug: Get all user accounts
    user_accounts = db.query(Accounts).filter(
        Accounts.user_id == current_user.id).all()
    print(f"   User has {len(user_accounts)} accounts")

    # Debug: Get all transactions for user
    all_user_transactions = (
        db.query(Transactions)
        .join(Accounts, Transactions.account_id == Accounts.id)
        .filter(Accounts.user_id == current_user.id)
        .all()
    )
    print(f"   Total transactions for user: {len(all_user_transactions)}")
    if all_user_transactions:
        print(
            f"   Transaction categories found: {set(t.category for t in all_user_transactions)}")

    transactions = (
        db.query(Transactions)
        .join(Accounts, Transactions.account_id == Accounts.id)
        .filter(
            Accounts.user_id == current_user.id,
            Transactions.category == category,
            extract("month", Transactions.txn_date) == month,
            extract("year", Transactions.txn_date) == year,
        )
        .order_by(Transactions.txn_date.desc())
        .all()
    )

    print(
        f"   Found: {len(transactions)} transactions for category '{category}'")
    if transactions:
        print(
            f"   First transaction: {transactions[0].category} - {transactions[0].amount}")

    return [
        {
            "id": t.id,
            "date": t.txn_date.isoformat() if t.txn_date else None,
            "description": t.description,
            "amount": float(t.amount),
            "category": t.category,
            "merchant": t.merchant,
            "status": t.status,
        }
        for t in transactions
    ]


# ============ DEBUG ENDPOINT ============

@router.get("/debug/all-transactions")
def debug_all_transactions(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Debug endpoint to see ALL transactions for current user"""
    transactions = (
        db.query(Transactions)
        .join(Accounts, Transactions.account_id == Accounts.id)
        .filter(Accounts.user_id == current_user.id)
        .all()
    )

    return {
        "total_transactions": len(transactions),
        "categories_found": list(set(t.category for t in transactions)),
        "transactions": [
            {
                "id": t.id,
                "date": t.txn_date.isoformat() if t.txn_date else None,
                "description": t.description,
                "amount": float(t.amount),
                "category": t.category,
                "merchant": t.merchant,
                "txn_type": t.txn_type,
            }
            for t in transactions[:20]  # Limit to first 20
        ]
    }
