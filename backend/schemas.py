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
    
from pydantic import BaseModel, EmailStr

class ForgotPassword(BaseModel):
    email: EmailStr

class VerifyOtp(BaseModel):
    email: EmailStr
    otp: str

class ResetPassword(BaseModel):
    email: EmailStr
    new_password: str


from pydantic import BaseModel, EmailStr

class SendRegisterOTP(BaseModel):
    email: EmailStr

class VerifyRegisterOTP(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    otp: str

# schemas.py
from pydantic import BaseModel, EmailStr, Field


class ResetPassword(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)


# schemas.py
from pydantic import BaseModel
from datetime import date
from typing import Optional

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

from datetime import datetime
from typing import Optional

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
        orm_mode = True


# ================= BUDGETS =================

from typing import Optional
from datetime import datetime



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
