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
    created_at = Column(DateTime, default=datetime.utcnow)
