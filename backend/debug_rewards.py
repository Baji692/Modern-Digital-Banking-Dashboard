#!/usr/bin/env python
"""Debug script to test the rewards endpoint manually"""

from fastapi import FastAPI
from database import SessionLocal, get_db
from models import User, Accounts, Transactions, Rewards
from routes.rewards import get_rewards_summary
from sqlalchemy.orm import Session

db = SessionLocal()

# Test with user 13
user_id = 13

print("=" * 60)
print(f"Testing rewards calculation for User {user_id}")
print("=" * 60)

# Get user
user = db.query(User).filter(User.id == user_id).first()
print(f"\n✓ User: {user.id} - {user.name}")

# Get accounts
accounts = db.query(Accounts).filter(Accounts.user_id == user_id).all()
print(f"✓ Accounts: {len(accounts)}")

# Get transactions through accounts
account_ids = [acc.id for acc in accounts]
print(f"  Account IDs: {account_ids}")

transactions = db.query(Transactions).filter(
    Transactions.account_id.in_(account_ids)
).all()

print(f"✓ Total Transactions: {len(transactions)}")

# Calculate rewards like the endpoint does
reward_breakdown = {
    "shopping": 0,
    "dining": 0,
    "utilities": 0,
    "groceries": 0,
    "other": 0,
}

print(f"\nProcessing transactions:")
for txn in transactions:
    if txn.txn_type == "debit":
        amount = float(txn.amount)
        category = (txn.category or "").lower()

        points = 0
        if "shopping" in category or "retail" in category:
            points = int(amount * 0.02)
            reward_breakdown["shopping"] += points
            cat_name = "shopping"
        elif "dining" in category or "food" in category:
            points = int(amount * 0.03)
            reward_breakdown["dining"] += points
            cat_name = "dining"
        elif "utilities" in category:
            points = int(amount * 0.01)
            reward_breakdown["utilities"] += points
            cat_name = "utilities"
        elif "groceries" in category:
            points = int(amount * 0.015)
            reward_breakdown["groceries"] += points
            cat_name = "groceries"
        else:
            points = int(amount * 0.01)
            reward_breakdown["other"] += points
            cat_name = "other"

        print(f"  {txn.category:15} | ₹{amount:8.2f} → {points:4} pts ({cat_name})")

total_reward_points = sum(reward_breakdown.values())
reward_value = total_reward_points // 100

print(f"\nBreakdown:")
for cat, pts in reward_breakdown.items():
    print(f"  {cat:12}: {pts:6} points")

print(f"\n✓ Total Points: {total_reward_points}")
print(f"✓ Cash Value: ₹{reward_value}")

print(f"\nExpected Response:")
print({
    "total_points": total_reward_points,
    "reward_value_inr": reward_value,
    "breakdown": reward_breakdown,
    "transaction_count": len([t for t in transactions if t.txn_type == "debit"]),
})

db.close()
