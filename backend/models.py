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
    created_at = Column(TIMESTAMP)


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
