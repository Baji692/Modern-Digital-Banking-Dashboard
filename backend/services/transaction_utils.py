from typing import Optional

CATEGORY_RULES = {
    "Food": ["grocery", "restaurant", "hotel", "food", "whole foods", "swiggy", "zomato"],
    "Utilities": ["electric", "electricity", "power", "water", "gas", "internet", "bsnl"],
    "Income": ["salary", "payroll", "credit"],
    "Shopping": ["amazon", "flipkart", "mall"],
    "Transport": ["uber", "ola", "fuel", "petrol"],
}

def auto_categorize(
    description: str,
    merchant: Optional[str],
    txn_type: str,
) -> str:
    text = f"{description or ''} {merchant or ''}".lower()

    if txn_type == "credit":
        return "Income"

    for category, keywords in CATEGORY_RULES.items():
        for word in keywords:
            if word in text:
                return category

    return "Uncategorized"
