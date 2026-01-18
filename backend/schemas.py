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


# ================= USER PROFILE =================


class UpdateUserProfile(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


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
    rollover_enabled: Optional[bool] = None
    is_spending_frozen: Optional[bool] = None
    color_code: Optional[str] = None


class BudgetOut(BaseModel):
    id: int
    category: str
    limit_amount: float
    spent_amount: float
    month: int
    year: int
    rollover_enabled: Optional[bool] = False
    is_spending_frozen: Optional[bool] = False
    color_code: Optional[str] = "default"

    class Config:
        from_attributes = True


# ================= BUDGET HISTORY =================


class BudgetHistoryCreate(BaseModel):
    budget_id: int
    category: str
    month: int
    year: int
    limit_amount: float
    spent_amount: float
    remaining_amount: float
    usage_percent: float


class BudgetHistoryOut(BaseModel):
    id: int
    budget_id: int
    category: str
    month: int
    year: int
    limit_amount: float
    spent_amount: float
    remaining_amount: float
    usage_percent: float

    class Config:
        from_attributes = True


# ================= BUDGET RECOMMENDATIONS =================


class BudgetRecommendationCreate(BaseModel):
    category: str
    current_budget: Optional[float] = None
    recommended_budget: float
    average_spend: float
    confidence_score: float = 0.0
    reasoning: Optional[str] = None


class BudgetRecommendationOut(BaseModel):
    id: int
    category: str
    current_budget: Optional[float]
    recommended_budget: float
    average_spend: float
    confidence_score: float
    reasoning: Optional[str]
    is_applied: bool

    class Config:
        from_attributes = True


# ================= CUSTOM BUDGET CATEGORIES =================


class CustomBudgetCategoryCreate(BaseModel):
    category_name: str
    icon_emoji: str = "💰"
    color_hex: str = "#2563eb"


class CustomBudgetCategoryOut(BaseModel):
    id: int
    category_name: str
    icon_emoji: str
    color_hex: str
    is_active: bool

    class Config:
        from_attributes = True


# ================= BUDGET SUBCATEGORIES =================


class BudgetSubcategoryCreate(BaseModel):
    parent_category: str
    subcategory_name: str
    limit_amount: float
    month: int
    year: int


class BudgetSubcategoryOut(BaseModel):
    id: int
    parent_category: str
    subcategory_name: str
    limit_amount: float
    spent_amount: float
    month: int
    year: int

    class Config:
        from_attributes = True


# ================= BUDGET ALERTS =================


class BudgetAlertOut(BaseModel):
    id: int
    budget_id: int
    category: str
    alert_type: str
    threshold_reached: int
    current_spending: float
    message: str
    is_read: bool

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

# ================= USER GOALS =================


class UserGoalsUpdate(BaseModel):
    savings_goal: Optional[float] = None
    spending_goal: Optional[float] = None
    bills_goal: Optional[float] = None


class UserGoalsResponse(BaseModel):
    id: int
    user_id: int
    savings_goal: float
    spending_goal: float
    bills_goal: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ================= CUSTOM GOALS =================


class CustomGoalCreate(BaseModel):
    name: str
    description: Optional[str] = None
    goal_type: str  # "amount" or "percentage"
    target_value: float
    current_value: Optional[float] = 0
    category: str  # "savings", "spending", "investment", "debt", "other"
    target_date: Optional[date] = None
    priority: Optional[str] = "medium"  # "low", "medium", "high"


class CustomGoalUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    category: Optional[str] = None
    target_date: Optional[date] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class CustomGoalResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str]
    goal_type: str
    target_value: float
    current_value: float
    category: str
    target_date: Optional[date]
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ================= EMAIL CHANGE OTP =================

class SendEmailOTP(BaseModel):
    email: EmailStr


class VerifyEmailOTP(BaseModel):
    user_id: int
    new_email: EmailStr
    name: Optional[str] = None
    otp: str = Field(..., min_length=6, max_length=6)
