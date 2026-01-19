from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum,
    TIMESTAMP,
    DateTime,
    Boolean,
    ForeignKey,
    Numeric,
    Date,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from datetime import datetime
import enum


# ================= USERS =================

class KYCStatus(enum.Enum):
    unverified = "unverified"
    verified = "verified"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(200), nullable=False)
    phone = Column(String(10), unique=True, nullable=False)
    kyc_status = Column(Enum(KYCStatus), default=KYCStatus.unverified)
    created_at = Column(TIMESTAMP, default=func.now())


# ================= EMAIL OTP =================

class EmailOTP(Base):
    __tablename__ = "email_otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    otp_hash = Column(String)
    purpose = Column(String)
    expires_at = Column(DateTime)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# ================= ACCOUNTS =================

class Accounts(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)

    bank_name = Column(String(100), nullable=False)
    account_type = Column(String(20), nullable=False)
    masked_account = Column(String(20), nullable=False)

    currency = Column(String(3), default="INR")
    balance = Column(Numeric(14, 2), default=0.00)

    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # ✅ FIXED
    transactions = relationship(
        "Transactions",
        back_populates="account",
        cascade="all, delete",
    )


# ================= TRANSACTIONS =================

class Transactions(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)

    description = Column(String(255))
    category = Column(String(50))
    merchant = Column(String(100))

    amount = Column(Numeric(14, 2), nullable=False)
    currency = Column(String(3), default="INR")

    txn_type = Column(String(10), nullable=False)
    status = Column(String(15), default="posted")

    txn_date = Column(DateTime, nullable=False)
    posted_date = Column(DateTime, default=datetime.utcnow)

    # ✅ FIXED
    account = relationship("Accounts", back_populates="transactions")


# ================= BILLS =================

class Bills(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)

    biller_name = Column(String(100), nullable=False)
    due_date = Column(Date, nullable=False)

    amount_due = Column(Numeric(14, 2), nullable=False)
    status = Column(String(15), default="upcoming")
    auto_pay = Column(Boolean, default=False)
    paid_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ================= BUDGETS =================

# ================= BUDGETS =================

# ================= BUDGETS =================

class Budgets(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)

    category = Column(String(50), nullable=False)

    limit_amount = Column(Numeric(14, 2), nullable=False)
    spent_amount = Column(Numeric(14, 2), default=0.00)

    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # New fields for enhanced features
    # Carry unused budget to next month
    rollover_enabled = Column(Boolean, default=False)
    # UI badge when limit hits
    is_spending_frozen = Column(Boolean, default=False)
    # For custom visual indicators
    color_code = Column(String(20), default="default")


# ================= BUDGET HISTORY =================


class BudgetHistory(Base):
    __tablename__ = "budget_history"

    id = Column(Integer, primary_key=True, index=True)
    budget_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)

    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)

    limit_amount = Column(Numeric(14, 2), nullable=False)
    spent_amount = Column(Numeric(14, 2), default=0.00)
    remaining_amount = Column(Numeric(14, 2), default=0.00)
    usage_percent = Column(Numeric(5, 2), default=0.00)

    created_at = Column(DateTime, default=datetime.utcnow)


# ================= BUDGET RECOMMENDATIONS =================


class BudgetRecommendation(Base):
    __tablename__ = "budget_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)

    current_budget = Column(Numeric(14, 2), nullable=True)
    recommended_budget = Column(Numeric(14, 2), nullable=False)
    average_spend = Column(Numeric(14, 2), nullable=False)

    confidence_score = Column(Numeric(5, 2), default=0.00)  # 0-100%
    reasoning = Column(String(500), nullable=True)  # Why this recommendation

    is_applied = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    applied_at = Column(DateTime, nullable=True)


# ================= CUSTOM BUDGET CATEGORIES =================


class CustomBudgetCategory(Base):
    __tablename__ = "custom_budget_categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)

    category_name = Column(String(50), nullable=False)
    icon_emoji = Column(String(10), default="💰")  # Emoji for icon
    color_hex = Column(String(7), default="#2563eb")  # Color picker value

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ================= BUDGET SUBCATEGORIES =================


class BudgetSubcategory(Base):
    __tablename__ = "budget_subcategories"

    id = Column(Integer, primary_key=True, index=True)
    budget_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)

    parent_category = Column(String(50), nullable=False)
    subcategory_name = Column(String(50), nullable=False)

    limit_amount = Column(Numeric(14, 2), nullable=False)
    spent_amount = Column(Numeric(14, 2), default=0.00)

    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)


# ================= BUDGET ALERTS =================


class BudgetAlert(Base):
    __tablename__ = "budget_alerts"

    id = Column(Integer, primary_key=True, index=True)
    budget_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)

    # THRESHOLD_80, THRESHOLD_90, THRESHOLD_100, PREDICTION
    alert_type = Column(String(20), nullable=False)
    threshold_reached = Column(Integer, default=0)  # %, 80, 90, 100
    current_spending = Column(Numeric(14, 2), nullable=False)

    message = Column(String(255), nullable=False)
    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)

# ================= REWARDS =================


class Rewards(Base):
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    program_name = Column(String(100), nullable=False)
    points_balance = Column(Integer, default=0)
    last_updated = Column(TIMESTAMP, default=func.now())


# ================= ALERTS =================

class Alerts(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, default=func.now())


# ================= ADMIN LOGS =================

class AdminLogs(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    target_type = Column(String(100), nullable=False)
    target_id = Column(Integer, nullable=False)
    timestamp = Column(TIMESTAMP, default=func.now())


# ================= REDEMPTIONS =================

class Redemptions(Base):
    __tablename__ = "redemptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Cashback, Gift Card, Travel, Shopping
    redemption_type = Column(String(50), nullable=False)
    points_used = Column(Integer, nullable=False)
    amount_value = Column(Numeric(12, 2), nullable=False)  # Value in INR
    partner = Column(String(100), nullable=True)  # Partner name if applicable
    # Pending, Completed, Cancelled
    status = Column(String(20), default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


# ================= USER GOALS =================

class UserGoals(Base):
    __tablename__ = "user_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     unique=True, nullable=False)
    savings_goal = Column(Numeric(5, 2), default=20.0)  # Percentage
    spending_goal = Column(Numeric(12, 2), default=100000.0)  # Currency amount
    bills_goal = Column(Numeric(5, 2), default=100.0)  # Percentage
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)


# ================= CUSTOM GOALS =================

class CustomGoal(Base):
    __tablename__ = "custom_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Goal name (e.g., "Vacation Fund")
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)  # Optional description
    goal_type = Column(String(20), nullable=False)  # "amount" or "percentage"
    # Target amount or percentage
    target_value = Column(Numeric(12, 2), nullable=False)
    current_value = Column(Numeric(12, 2), default=0)  # Current progress
    # "savings", "spending", "investment", "debt", "other"
    category = Column(String(50), nullable=False)
    target_date = Column(Date, nullable=True)  # When to achieve the goal
    priority = Column(String(20), default="medium")  # "low", "medium", "high"
    # "active", "completed", "paused"
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)


# ================= REFERRALS =================

class Referrals(Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    referred_email = Column(String(100), nullable=False)
    referred_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    referral_code = Column(String(50), unique=True, nullable=False)
    bonus_points = Column(Integer, default=500)
    # Pending, Completed, Cancelled
    status = Column(String(20), default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
