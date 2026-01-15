from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Transactions, Redemptions, Accounts, User
from dependencies import get_current_user
from typing import List
import io
import csv

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/transactions/{user_id}")
def export_transactions_csv(user_id: int, format: str = Query("csv"), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Export transactions as CSV (format=csv). PDF not implemented."""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    accounts = db.query(Accounts).filter(Accounts.user_id == user_id).all()
    account_ids = [a.id for a in accounts]
    txns = db.query(Transactions).filter(
        Transactions.account_id.in_(account_ids)).all()

    if format != "csv":
        raise HTTPException(
            status_code=501, detail="Only CSV export is implemented")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "account_id", "date", "merchant",
                    "category", "amount", "type", "description"])
    for t in txns:
        writer.writerow([t.id, t.account_id, t.txn_date.isoformat() if t.txn_date else "",
                        t.merchant or "", t.category or "", str(t.amount), t.txn_type, t.description or ""])

    output.seek(0)
    headers = {
        "Content-Disposition": f"attachment; filename=transactions_{user_id}.csv"
    }
    return StreamingResponse(output, media_type="text/csv", headers=headers)


@router.get("/redemptions/{user_id}")
def export_redemptions_csv(user_id: int, format: str = Query("csv"), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    redemptions = db.query(Redemptions).filter(
        Redemptions.user_id == user_id).order_by(Redemptions.created_at.desc()).all()

    if format != "csv":
        raise HTTPException(
            status_code=501, detail="Only CSV export is implemented")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "type", "points_used", "amount_value",
                    "status", "created_at", "completed_at", "partner"])
    for r in redemptions:
        writer.writerow([r.id, r.redemption_type, r.points_used, str(r.amount_value), r.status, r.created_at.isoformat(
        ) if r.created_at else "", r.completed_at.isoformat() if r.completed_at else "", r.partner or ""])

    output.seek(0)
    headers = {
        "Content-Disposition": f"attachment; filename=redemptions_{user_id}.csv"}
    return StreamingResponse(output, media_type="text/csv", headers=headers)
