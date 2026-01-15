from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Transactions, Accounts, Bills, Budgets, User
from dependencies import get_current_user
from datetime import datetime, timedelta
from typing import Dict, List, Optional

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/analytics/{user_id}")
def get_analytics(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get comprehensive financial analytics for insights page"""
    # Verify user is requesting their own data
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this user's insights")

    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all accounts for the user
    accounts = db.query(Accounts).filter(Accounts.user_id == user_id).all()
    account_ids = [acc.id for acc in accounts]

    # Get all transactions
    transactions = db.query(Transactions).filter(
        Transactions.account_id.in_(account_ids)
    ).all()

    # Get bills
    bills = db.query(Bills).filter(Bills.user_id == user_id).all()

    # Category analysis - spending by category
    category_data = {}
    for txn in transactions:
        if txn.txn_type == "debit":
            category = txn.category or "Other"
            amount = float(txn.amount)
            category_data[category] = category_data.get(category, 0) + amount

    # Merchant analysis - spending by merchant
    merchant_data = {}
    for txn in transactions:
        if txn.merchant and txn.txn_type == "debit":
            merchant = txn.merchant
            amount = float(txn.amount)
            merchant_data[merchant] = merchant_data.get(merchant, 0) + amount

    # Monthly trend - last 6 months
    monthly_trend = {}
    current_date = datetime.now()
    for i in range(6):
        month_date = current_date - timedelta(days=30 * i)
        month_key = f"{month_date.month}/{month_date.year}"
        monthly_trend[month_key] = 0

    for txn in transactions:
        if txn.txn_type == "debit" and txn.txn_date:
            txn_date = txn.txn_date if isinstance(
                txn.txn_date, datetime) else datetime.fromisoformat(str(txn.txn_date))
            month_key = f"{txn_date.month}/{txn_date.year}"
            if month_key in monthly_trend:
                monthly_trend[month_key] += float(txn.amount)

    # Sort monthly trend chronologically
    sorted_monthly = sorted(
        monthly_trend.items(),
        key=lambda x: (int(x[0].split('/')[1]), int(x[0].split('/')[0]))
    )

    # Calculate totals
    total_spending = sum(float(t.amount)
                         for t in transactions if t.txn_type == "debit")
    paid_bills = len([b for b in bills if b.status == "paid"])
    bills_paid_amount = sum(float(b.amount_due)
                            for b in bills if b.status == "paid")
    total_bills_amount = sum(float(b.amount_due) for b in bills)
    savings_rate = ((bills_paid_amount / (total_spending + bills_paid_amount))
                    * 100) if (total_spending + bills_paid_amount) > 0 else 0

    # Week analysis for alerts
    week_ago = datetime.now() - timedelta(days=7)
    this_week_txns = [t for t in transactions if t.txn_date and (
        t.txn_date if isinstance(
            t.txn_date, datetime) else datetime.fromisoformat(str(t.txn_date))
    ) > week_ago and t.txn_type == "debit"]
    this_week_spending = sum(float(t.amount) for t in this_week_txns)

    return {
        "category_data": category_data,
        "merchant_data": merchant_data,
        "monthly_trend": sorted_monthly,
        "total_spending": total_spending,
        "paid_bills": paid_bills,
        "bills_paid_amount": bills_paid_amount,
        "total_bills": len(bills),
        "total_bills_amount": total_bills_amount,
        "savings_rate": savings_rate,
        "this_week_spending": this_week_spending,
        "transaction_count": len([t for t in transactions if t.txn_type == "debit"]),
    }


@router.get("/top-categories/{user_id}")
def get_top_categories(user_id: int, limit: int = 5, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get top spending categories"""
    # Verify user is requesting their own data
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this user's insights")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    accounts = db.query(Accounts).filter(Accounts.user_id == user_id).all()
    account_ids = [acc.id for acc in accounts]

    transactions = db.query(Transactions).filter(
        Transactions.account_id.in_(account_ids),
        Transactions.txn_type == "debit"
    ).all()

    category_data = {}
    for txn in transactions:
        category = txn.category or "Other"
        amount = float(txn.amount)
        category_data[category] = category_data.get(category, 0) + amount

    sorted_categories = sorted(
        category_data.items(), key=lambda x: x[1], reverse=True)[:limit]
    return {
        "categories": [{"name": cat, "amount": amount} for cat, amount in sorted_categories]
    }


@router.get("/top-merchants/{user_id}")
def get_top_merchants(user_id: int, limit: int = 5, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get top spending merchants"""
    # Verify user is requesting their own data
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this user's insights")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    accounts = db.query(Accounts).filter(Accounts.user_id == user_id).all()
    account_ids = [acc.id for acc in accounts]

    transactions = db.query(Transactions).filter(
        Transactions.account_id.in_(account_ids),
        Transactions.txn_type == "debit"
    ).all()

    merchant_data = {}
    for txn in transactions:
        if txn.merchant:
            merchant = txn.merchant
            amount = float(txn.amount)
            merchant_data[merchant] = merchant_data.get(merchant, 0) + amount

    sorted_merchants = sorted(merchant_data.items(),
                              key=lambda x: x[1], reverse=True)[:limit]
    return {
        "merchants": [{"name": merchant, "amount": amount} for merchant, amount in sorted_merchants]
    }


@router.get("/spending-gauge/{user_id}")
def get_spending_gauge(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get spending progress gauges"""
    # Verify user is requesting their own data
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this user's insights")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    accounts = db.query(Accounts).filter(Accounts.user_id == user_id).all()
    account_ids = [acc.id for acc in accounts]

    transactions = db.query(Transactions).filter(
        Transactions.account_id.in_(account_ids),
        Transactions.txn_type == "debit"
    ).all()

    bills = db.query(Bills).filter(Bills.user_id == user_id).all()

    total_spending = sum(float(t.amount) for t in transactions)
    paid_bills = sum(float(b.amount_due) for b in bills if b.status == "paid")
    total_bills = sum(float(b.amount_due) for b in bills)
    savings_rate = ((paid_bills / (total_spending + paid_bills))
                    * 100) if (total_spending + paid_bills) > 0 else 0

    return {
        "spending_progress": {
            "current": total_spending * 0.4,
            "budget": total_spending or 1,
            "label": "Spending Progress"
        },
        "bills_paid": {
            "current": paid_bills,
            "budget": total_bills or 1,
            "label": "Bills Paid"
        },
        "savings_rate": {
            "current": savings_rate,
            "budget": 20,
            "label": "Savings Rate %"
        }
    }
