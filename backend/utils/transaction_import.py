import csv
from datetime import datetime


def parse_transactions_csv(file):
    """
    Expected CSV format:
    date,description,merchant,amount,type
    """

    content = file.file.read().decode("utf-8").splitlines()
    reader = csv.DictReader(content)

    transactions = []

    for row in reader:
        try:
            transactions.append({
                "txn_date": datetime.fromisoformat(row["date"]),
                "description": row.get("description", "").strip(),
                "merchant": row.get("merchant", "").strip(),
                "amount": float(row["amount"]),
                "txn_type": row["type"].lower(),
                "category": "Uncategorized",
            })
        except Exception as e:
            raise ValueError(f"Invalid CSV row: {row}") from e

    return transactions
