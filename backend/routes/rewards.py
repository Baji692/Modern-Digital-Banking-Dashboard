from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
from models import Rewards, User, Transactions, Accounts, Redemptions, Referrals
from schemas import RewardCreate, RewardResponse, RedemptionCreate, RedemptionResponse, ReferralCreate, ReferralResponse
from dependencies import get_current_user
from typing import List, Optional
import logging
from datetime import datetime, timedelta
from decimal import Decimal
import random
import string
import os
import requests
from sqlalchemy.sql import func
from sqlalchemy import or_
from email_service import send_email, send_referral_invite

router = APIRouter(prefix="/rewards", tags=["rewards"])


@router.get("/", response_model=List[RewardResponse])
def get_user_rewards(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get all rewards for a user"""
    rewards = db.query(Rewards).filter(
        Rewards.user_id == current_user.id).all()
    return rewards


@router.get("/summary/{user_id}")
def get_rewards_summary(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get comprehensive rewards summary with calculations"""
    # Verify user is requesting their own data
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this user's rewards")

    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all transactions for the user through their accounts
    accounts = db.query(Accounts).filter(Accounts.user_id == user_id).all()
    account_ids = [acc.id for acc in accounts]

    transactions = db.query(Transactions).filter(
        Transactions.account_id.in_(account_ids)
    ).all()

    # Calculate reward points from transactions
    current_points = 0

    # Calculate rewards breakdown by category
    reward_breakdown = {
        "shopping": 0,
        "dining": 0,
        "utilities": 0,
        "groceries": 0,
        "other": 0,
        "referral": 0,
        "manual": 0
    }

    for txn in transactions:
        if txn.txn_type == "debit":
            amount = float(txn.amount)
            category = (txn.category or "").lower()

            pts = 0
            if "shopping" in category or "retail" in category:
                pts = int(amount * 0.02)
                reward_breakdown["shopping"] += pts
            elif "dining" in category or "food" in category:
                pts = int(amount * 0.03)
                reward_breakdown["dining"] += pts
            elif "utilities" in category:
                pts = int(amount * 0.01)
                reward_breakdown["utilities"] += pts
            elif "groceries" in category:
                pts = int(amount * 0.015)
                reward_breakdown["groceries"] += pts
            else:
                pts = int(amount * 0.01)
                reward_breakdown["other"] += pts
            
            current_points += pts

    # Add referral points to total and breakdown
    try:
        referral_points = db.query(func.coalesce(func.sum(Referrals.bonus_points), 0)).filter(
            Referrals.referrer_id == user_id,
            Referrals.status == "Completed"
        ).scalar() or 0
    except Exception:
        referral_points = 0
    
    reward_breakdown["referral"] = int(referral_points)
    
    # Add manual points from Rewards table
    try:
        manual_points = db.query(func.coalesce(func.sum(Rewards.points_balance), 0)).filter(
            Rewards.user_id == user_id
        ).scalar() or 0
    except Exception:
        manual_points = 0
    
    reward_breakdown["manual"] = int(manual_points)

    total_reward_points = current_points + int(referral_points) + int(manual_points)
    # NOTE: business rule: 100 points => ₹1
    reward_value = total_reward_points // 100

    # Subtract BOTH Completed and Pending redemptions from available points
    # This prevents double-spending points while a request is being processed
    try:
        redeemed_sum = db.query(func.coalesce(func.sum(Redemptions.points_used), 0)).filter(
            Redemptions.user_id == user_id,
            Redemptions.status.in_(["Completed", "Pending"])
        ).scalar() or 0
    except Exception:
        redeemed_sum = 0

    available_points = max(0, int(total_reward_points - int(redeemed_sum)))

    logging.info(
        f"User {user_id} - Total: {total_reward_points} (Txn: {current_points}, Ref: {referral_points}, Man: {manual_points}), Redeemed: {int(redeemed_sum)}, Available: {available_points}")

    # Get pending redemptions to show user
    try:
        pending_redemptions = db.query(Redemptions).filter(
            Redemptions.user_id == user_id,
            Redemptions.status == "Pending"
        ).all()
        pending_redemptions_data = [
            {
                "id": r.id,
                "type": r.redemption_type,
                "points": int(r.points_used),
                "amount": float(r.amount_value),
                "date": r.created_at.isoformat() if r.created_at else None,
            }
            for r in pending_redemptions
        ]
    except Exception:
        pending_redemptions_data = []

    # Currency summaries using external exchange rate API (optional)
    exchange_api = os.getenv(
        "EXCHANGE_API_URL", "https://api.exchangerate.host/latest")
    currency_summary = {"INR": reward_value}
    try:
        resp = requests.get(exchange_api, params={
                            "base": "INR", "symbols": "USD,EUR,GBP"}, timeout=3)
        if resp.status_code == 200:
            data = resp.json()
            rates = data.get("rates", {})
            # Convert INR reward_value to other currencies
            for cur, rate in rates.items():
                try:
                    currency_summary[cur] = round(
                        float(reward_value) * float(rate), 2)
                except Exception:
                    currency_summary[cur] = None
    except Exception:
        # If external API fails, continue without currency conversions
        pass

    # Calculate points earned this month
    try:
        now = datetime.utcnow()
        month_start = datetime(now.year, now.month, 1)
        # Transactions in the current month
        monthly_points = 0
        for txn in transactions:
            if txn.txn_type != "debit" or not txn.txn_date:
                continue
            txn_dt = txn.txn_date if isinstance(
                txn.txn_date, datetime) else datetime.fromisoformat(str(txn.txn_date))
            if txn_dt >= month_start:
                amt = float(txn.amount)
                cat = (txn.category or "").lower()
                if "shopping" in cat or "retail" in cat:
                    monthly_points += int(amt * 0.02)
                elif "dining" in cat or "food" in cat:
                    monthly_points += int(amt * 0.03)
                elif "utilities" in cat:
                    monthly_points += int(amt * 0.01)
                elif "groceries" in cat:
                    monthly_points += int(amt * 0.015)
                else:
                    monthly_points += int(amt * 0.01)
    except Exception:
        monthly_points = 0

    logging.info(f"=== SUMMARY for user {user_id} ===")
    logging.info(f"Total Points: {total_reward_points}")
    logging.info(f"Redeemed Sum: {redeemed_sum}")
    logging.info(f"Available Points: {available_points}")
    logging.info(f"Monthly Points: {monthly_points}")
    logging.info(f"Pending Redemptions: {len(pending_redemptions_data)}")

    return {
        "total_points": total_reward_points,
        "available_points": available_points,
        "pending_redemptions": pending_redemptions_data,
        "monthly_points": monthly_points,
        "reward_value_inr": reward_value,
        "currency_summary": currency_summary,
        "breakdown": reward_breakdown,
        "transaction_count": len([t for t in transactions if t.txn_type == "debit"]),
    }


@router.get("/breakdown/{user_id}")
def get_rewards_breakdown(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get detailed breakdown of rewards by category and transactions"""
    # Verify user is requesting their own data
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this user's rewards")

    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all transactions for the user
    accounts = db.query(Accounts).filter(Accounts.user_id == user_id).all()
    account_ids = [acc.id for acc in accounts]

    transactions = db.query(Transactions).filter(
        Transactions.account_id.in_(account_ids),
        Transactions.txn_type == "debit"
    ).all()

    # Calculate points for each transaction
    transaction_details = []
    for txn in transactions:
        amount = float(txn.amount)
        category = (txn.category or "").lower()

        if "shopping" in category or "retail" in category:
            points = int(amount * 0.02)
        elif "dining" in category or "food" in category:
            points = int(amount * 0.03)
        elif "utilities" in category:
            points = int(amount * 0.01)
        elif "groceries" in category:
            points = int(amount * 0.015)
        else:
            points = int(amount * 0.01)

        transaction_details.append({
            "merchant": txn.merchant or txn.description,
            "category": txn.category or "Other",
            "amount": amount,
            "points": points,
            "date": txn.txn_date.isoformat() if txn.txn_date else None,
        })

    return {
        "transactions": transaction_details,
        "total_transactions": len(transaction_details),
        "total_points": sum(t["points"] for t in transaction_details),
    }


# Move redemption-history above the generic reward id route so literal paths
# like '/redemption-history' are matched before the dynamic '/{reward_id}'
@router.get("/redemption-history")
def get_redemption_history(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get user's redemption history"""
    try:
        redemptions = db.query(Redemptions).filter(
            Redemptions.user_id == current_user.id
        ).order_by(Redemptions.created_at.desc()).all()

        result = [
            {
                "id": r.id,
                "user_id": r.user_id,
                "type": r.redemption_type,
                "amount": str(r.amount_value),
                "date": r.created_at.isoformat() if r.created_at else None,
                "status": r.status,
                "pointsUsed": int(r.points_used),
                "partner": r.partner or "",
            }
            for r in redemptions
        ]

        logging.info(
            f"Redemption history for user {current_user.id}: {len(result)} records")
        for item in result:
            logging.info(
                f"  - {item['type']} ({item['status']}): {item['pointsUsed']} pts = ₹{item['amount']}")

        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching redemption history: {str(e)}")


@router.get("/{reward_id}", response_model=RewardResponse)
def get_reward(reward_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get a specific reward"""
    reward = db.query(Rewards).filter(Rewards.id == reward_id).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    # Verify ownership
    if reward.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this reward")

    return reward


@router.post("/", response_model=RewardResponse)
def create_reward(reward: RewardCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Create a new reward entry"""
    # Verify user exists
    user = db.query(User).filter(User.id == reward.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Only allow creating rewards for the current user
    if current_user.id != reward.user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to create rewards for this user")

    db_reward = Rewards(
        user_id=reward.user_id,
        program_name=reward.program_name,
        points_balance=reward.points_balance
    )
    try:
        db.add(db_reward)
        db.commit()
        db.refresh(db_reward)
        return db_reward
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error creating reward")


@router.put("/{reward_id}", response_model=RewardResponse)
def update_reward(reward_id: int, reward: RewardCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Update a reward entry"""
    db_reward = db.query(Rewards).filter(Rewards.id == reward_id).first()
    if not db_reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    # Verify ownership
    if db_reward.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this reward")

    db_reward.program_name = reward.program_name
    db_reward.points_balance = reward.points_balance

    try:
        db.commit()
        db.refresh(db_reward)
        return db_reward
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error updating reward")


@router.delete("/{reward_id}")
def delete_reward(reward_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Delete a reward entry"""
    db_reward = db.query(Rewards).filter(Rewards.id == reward_id).first()
    if not db_reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    # Verify ownership
    if db_reward.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this reward")

    try:
        db.delete(db_reward)
        db.commit()
        return {"message": "Reward deleted successfully"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error deleting reward")


# ================= REDEMPTIONS =================

@router.post("/redeem", response_model=RedemptionResponse)
def redeem_points(data: RedemptionCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Redeem reward points"""
    # Get user's current reward points
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all transactions to calculate current points
    accounts = db.query(Accounts).filter(
        Accounts.user_id == current_user.id).all()
    account_ids = [acc.id for acc in accounts]

    transactions = db.query(Transactions).filter(
        Transactions.account_id.in_(account_ids)
    ).all()

    # Calculate current points from transactions
    current_points = 0
    for txn in transactions:
        if txn.txn_type == "debit":
            amount = float(txn.amount)
            category = (txn.category or "").lower()
            if "shopping" in category or "retail" in category:
                current_points += int(amount * 0.02)
            elif "dining" in category or "food" in category:
                current_points += int(amount * 0.03)
            elif "utilities" in category:
                current_points += int(amount * 0.01)
            elif "groceries" in category:
                current_points += int(amount * 0.015)
            else:
                current_points += int(amount * 0.01)

    # Add referral points
    try:
        referral_points = db.query(func.coalesce(func.sum(Referrals.bonus_points), 0)).filter(
            Referrals.referrer_id == current_user.id,
            Referrals.status == "Completed"
        ).scalar() or 0
    except Exception:
        referral_points = 0
    
    # Add manual points
    try:
        manual_points = db.query(func.coalesce(func.sum(Rewards.points_balance), 0)).filter(
            Rewards.user_id == current_user.id
        ).scalar() or 0
    except Exception:
        manual_points = 0

    total_reward_points = current_points + int(referral_points) + int(manual_points)

    # Subtract BOTH Completed and Pending redemptions from available points
    try:
        redeemed_sum = db.query(func.coalesce(func.sum(Redemptions.points_used), 0)).filter(
            Redemptions.user_id == current_user.id,
            Redemptions.status.in_(["Completed", "Pending"])
        ).scalar() or 0
    except Exception as e:
        redeemed_sum = 0

    available_points = max(0, int(total_reward_points - int(redeemed_sum)))

    # Check if user has enough available points
    if available_points < data.points_to_use:
        raise HTTPException(
            status_code=400, detail=f"Insufficient points. You have {available_points} available points")

    # Validate redemption type and calculate value
    redemption_rates = {
        "Cashback": 0.01,  # 100 points = ₹1
        "Gift Cards": 0.0095,  # 100 points = ₹0.95
        "Travel": 0.0090,  # 100 points = ₹0.90
        "Shopping": 0.0095,  # 100 points = ₹0.95
    }

    if data.redemption_type not in redemption_rates:
        raise HTTPException(status_code=400, detail="Invalid redemption type")

    amount_value = Decimal(str(data.points_to_use)) * \
        Decimal(str(redemption_rates[data.redemption_type]))

    # Determine redemption status - Cashback is instantly completed
    redemption_status = "Completed" if data.redemption_type == "Cashback" else "Pending"

    # Create redemption record
    redemption = Redemptions(
        user_id=current_user.id,
        redemption_type=data.redemption_type,
        points_used=data.points_to_use,
        amount_value=amount_value,
        partner=data.partner,
        status=redemption_status
    )

    try:
        db.add(redemption)
        db.flush()  # Flush to check for errors before commit

        # If Cashback redemption, instantly credit to primary account
        if data.redemption_type == "Cashback":
            try:
                # Find primary savings account
                primary_account = db.query(Accounts).filter(
                    Accounts.user_id == current_user.id,
                    Accounts.account_type == "savings"
                ).order_by(Accounts.id).first()

                if not primary_account:
                    # Fallback to first account
                    primary_account = db.query(Accounts).filter(
                        Accounts.user_id == current_user.id
                    ).order_by(Accounts.id).first()

                if primary_account:
                    # Update account balance using Decimal for precision
                    current_balance = Decimal(
                        str(primary_account.balance or 0))
                    amount_decimal = Decimal(str(amount_value))
                    primary_account.balance = current_balance + amount_decimal

                    # Create credit transaction with HD Cashback label
                    credit_txn = Transactions(
                        account_id=primary_account.id,
                        txn_type="credit",
                        amount=amount_decimal,
                        description="HD Cashback",
                        merchant="HD Banking Rewards",
                        category="Cashback",
                        currency="INR",
                        txn_date=datetime.now(),
                        status="posted"
                    )

                    db.add(primary_account)
                    db.add(credit_txn)
            except Exception as cashback_err:
                logging.error(f"Error preparing cashback: {str(cashback_err)}")
                # Continue - cashback will fail but redemption is still valid

        # Now commit everything together
        db.commit()
        db.refresh(redemption)

        logging.info(
            f"✓ Redemption created - User: {current_user.id}, Type: {data.redemption_type}, Points: {data.points_to_use}, Status: {redemption_status}, ID: {redemption.id}")

        return redemption
    except IntegrityError as ie:
        db.rollback()
        logging.error(f"IntegrityError creating redemption: {str(ie)}")
        raise HTTPException(
            status_code=400, detail="Error creating redemption")
    except Exception as e:
        db.rollback()
        logging.error(f"Error creating redemption: {str(e)}")
        raise HTTPException(
            status_code=400, detail=f"Error: {str(e)}")


# ================= REFERRALS =================

@router.post("/referral/create")
def create_referral(data: ReferralCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Create a new referral"""
    # Check if referral code already exists for this user
    existing = db.query(Referrals).filter(
        Referrals.referrer_id == current_user.id,
        Referrals.referred_email == data.referred_email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400, detail="Already referred this email")

    # Generate unique referral code
    referral_code = f"BANK{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"

    # Check if referred user exists
    referred_user = db.query(User).filter(
        User.email == data.referred_email).first()

    referral = Referrals(
        referrer_id=current_user.id,
        referred_email=data.referred_email,
        referred_user_id=referred_user.id if referred_user else None,
        referral_code=referral_code,
        bonus_points=500,
        status="Completed" if referred_user else "Pending"
    )

    try:
        db.add(referral)
        db.commit()
        db.refresh(referral)
        # Attempt to send referral email (non-blocking on failure)
        try:
            frontend_base = os.getenv(
                "FRONTEND_BASE_URL", "http://localhost:3000")
            inviter_name = current_user.name or 'A friend'
            send_referral_invite(data.referred_email,
                                 inviter_name, referral_code, frontend_base)
        except Exception as e:
            logging.getLogger(__name__).exception(
                "Failed to send referral email: %s", e)

        return {
            "referral_code": referral_code,
            "bonus_points": 500,
            "status": referral.status,
            "message": "Referral created successfully!"
        }
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error creating referral")


@router.get("/referral/stats")
def get_referral_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get user's referral statistics"""
    referrals = db.query(Referrals).filter(
        Referrals.referrer_id == current_user.id
    ).all()

    completed_referrals = [r for r in referrals if r.status == "Completed"]
    total_bonus = sum(r.bonus_points for r in completed_referrals)

    return {
        "friends_referred": len(completed_referrals),
        "bonus_points_earned": total_bonus,
        "referral_code": referrals[0].referral_code if referrals else f"BANK{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}",
        "total_referrals": len(referrals),
    }


@router.get("/referral/list")
def get_referral_list(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Return the list of referrals for the current user with email and name when available."""
    referrals = db.query(Referrals).filter(
        Referrals.referrer_id == current_user.id
    ).order_by(Referrals.created_at.desc()).all()

    result = []
    for r in referrals:
        referred_name = None
        if r.referred_user_id:
            u = db.query(User).filter(User.id == r.referred_user_id).first()
            if u:
                referred_name = u.name

        result.append({
            "id": r.id,
            "referred_email": r.referred_email,
            "referred_name": referred_name,
            "status": r.status,
            "referral_code": r.referral_code,
            "bonus_points": r.bonus_points,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })

    return {"referrals": result, "total": len(result)}


@router.get("/referral/code")
def get_or_create_referral_code(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Get user's referral code"""
    # Check if user has a referral code
    existing = db.query(Referrals).filter(
        Referrals.referrer_id == current_user.id
    ).first()

    if existing:
        return {"referral_code": existing.referral_code}

    # Create default referral code
    referral_code = f"BANK{current_user.id}{''.join(random.choices(string.ascii_uppercase, k=4))}"

    referral = Referrals(
        referrer_id=current_user.id,
        referred_email="",
        referral_code=referral_code,
        bonus_points=500,
        status="Active"
    )

    try:
        db.add(referral)
        db.commit()
        return {"referral_code": referral_code}
    except IntegrityError:
        db.rollback()
        return {"referral_code": referral_code}
