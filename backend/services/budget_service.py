from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from models import Transactions, Budgets, Accounts


def calculate_spent_amount(
    db: Session,
    user_id: int,
    category: str,
    month: int,
    year: int,
):
    """
    Calculate total spent amount for a category in a given month/year
    """

    total = (
        db.query(func.coalesce(func.sum(Transactions.amount), 0))
        .join(Accounts, Accounts.id == Transactions.account_id)
        .filter(
            Accounts.user_id == user_id,
            Transactions.txn_type == "debit",
            Transactions.category == category,
            extract("month", Transactions.txn_date) == month,
            extract("year", Transactions.txn_date) == year,
        )
        .scalar()
    )

    return float(total)
