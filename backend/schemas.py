from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from datetime import date
from pydantic import BaseModel
from pydantic import BaseModel, EmailStr, Field
from pydantic import BaseModel, Field, EmailStr


class RegisterUser(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str = Field(
        pattern=r"^[6-9]\d{9}$",
        description="Indian phone number (10 digits)"
    )


class LoginUser(BaseModel):
    email: EmailStr
    password: str


class ForgotPassword(BaseModel):
    email: EmailStr


class ForgotPassword(BaseModel):
    email: EmailStr


class VerifyOtp(BaseModel):
    email: EmailStr
    otp: str


class ResetPassword(BaseModel):
    email: EmailStr
    new_password: str


class SendRegisterOTP(BaseModel):
    email: EmailStr


class VerifyRegisterOTP(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    otp: str


# schemas.py


class ResetPassword(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)


# schemas.py

# ================= ACCOUNTS =================


class AccountCreate(BaseModel):
    bank_name: str
    account_type: str
    masked_account: str
    currency: str = "INR"
    balance: float = 0.0
    is_primary: bool = False


class AccountUpdate(BaseModel):
    bank_name: Optional[str] = None
    account_type: Optional[str] = None
    masked_account: Optional[str] = None
    balance: Optional[float] = None
    currency: Optional[str] = None
    is_primary: Optional[bool] = None


# ================= BILLS =================

class BillCreate(BaseModel):
    biller_name: str
    due_date: date
    amount_due: float
    auto_pay: bool = False


class BillUpdate(BaseModel):
    biller_name: Optional[str]
    due_date: Optional[date]
    amount_due: Optional[float]
    status: Optional[str]
    auto_pay: Optional[bool]


# ================= TRANSACTIONS =================


class TransactionCreate(BaseModel):
    account_id: int
    description: str
    merchant: Optional[str] = None
    amount: float
    currency: str = "INR"
    txn_type: str  # debit / credit
    txn_date: datetime


class TransactionUpdate(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    merchant: Optional[str] = None


class TransactionOut(BaseModel):
    id: int
    account_id: int
    description: str
    category: Optional[str]
    merchant: Optional[str]
    amount: float
    currency: str
    txn_type: str
    status: str
    txn_date: datetime

    class Config:
        from_attributes = True


# ================= BUDGETS =================


# ================= BUDGETS =================

class BudgetCreate(BaseModel):
    category: str
    limit_amount: float
    month: int
    year: int


class BudgetUpdate(BaseModel):
    limit_amount: Optional[float] = None
    spent_amount: Optional[float] = None


class BudgetOut(BaseModel):
    id: int
    category: str
    limit_amount: float
    spent_amount: float
    month: int
    year: int

    class Config:
        from_attributes = True

# ================= REWARDS =================


class RewardCreate(BaseModel):
    user_id: int
    program_name: str
    points_balance: int = 0


class RewardUpdate(BaseModel):
    program_name: Optional[str] = None
    points_balance: Optional[int] = None


class RewardResponse(BaseModel):
    id: int
    user_id: int
    program_name: str
    points_balance: int
    last_updated: datetime

    class Config:
        from_attributes = True


# ================= ALERTS =================

class AlertCreate(BaseModel):
    user_id: int
    type: str
    message: str


class AlertUpdate(BaseModel):
    type: Optional[str] = None
    message: Optional[str] = None


class AlertResponse(BaseModel):
    id: int
    user_id: int
    type: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


# ================= ADMIN LOGS =================

class AdminLogCreate(BaseModel):
    admin_id: int
    action: str
    target_type: str
    target_id: int


class AdminLogResponse(BaseModel):
    id: int
    admin_id: int
    action: str
    target_type: str
    target_id: int
    timestamp: datetime

    class Config:
        from_attributes = True


# ================= REDEMPTIONS =================

class RedemptionCreate(BaseModel):
    redemption_type: str
    points_to_use: int
    partner: Optional[str] = None


class RedemptionResponse(BaseModel):
    id: int
    user_id: int
    redemption_type: str
    points_used: int
    amount_value: float
    partner: Optional[str]
    status: str
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


# ================= REFERRALS =================

class ReferralCreate(BaseModel):
    referred_email: str


class ReferralResponse(BaseModel):
    id: int
    referrer_id: int
    referred_email: str
    referred_user_id: Optional[int]
    referral_code: str
    bonus_points: int
    status: str
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True
