from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class KYCStatus(str, Enum):
    unverified = "unverified"
    verified = "verified"


class AccountType(str, Enum):
    savings = "savings"
    checking = "checking"
    credit_card = "credit_card"
    loan = "loan"
    investment = "investment"


class TxnType(str, Enum):
    debit = "debit"
    credit = "credit"


class User(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    kyc_status: KYCStatus
    created_at: datetime


class Account(BaseModel):
    id: int
    user_id: int
    bank_name: str
    account_type: AccountType
    masked_account: str
    currency: str
    balance: float
    created_at: datetime


class Transaction(BaseModel):
    id: int
    account_id: int
    description: str
    category: str
    amount: float
    currency: str
    txn_type: TxnType
    merchant: str
    txn_date: datetime
    posted_date: datetime
