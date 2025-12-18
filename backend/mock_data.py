from datetime import datetime
from models import User, Account, Transaction, AccountType, TxnType, KYCStatus

users = [
    User(
        id=1,
        name="John Doe",
        email="john@example.com",
        phone="9999999999",
        kyc_status=KYCStatus.verified,
        created_at=datetime.utcnow()
    )
]

accounts = [
    Account(
        id=1,
        user_id=1,
        bank_name="FinBank",
        account_type=AccountType.savings,
        masked_account="****1234",
        currency="INR",
        balance=16521.25,
        created_at=datetime.utcnow()
    )
]

transactions = []
