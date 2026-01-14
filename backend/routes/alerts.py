from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
from models import Alerts, User
from schemas import AlertCreate, AlertResponse
from typing import List

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=List[AlertResponse])
def get_user_alerts(db: Session = Depends(get_db), user_id: int = None):
    """Get all alerts for a user"""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    alerts = db.query(Alerts).filter(Alerts.user_id == user_id).order_by(
        Alerts.created_at.desc()).all()
    return alerts


@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    """Get a specific alert"""
    alert = db.query(Alerts).filter(Alerts.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.post("/", response_model=AlertResponse)
def create_alert(alert: AlertCreate, db: Session = Depends(get_db)):
    """Create a new alert"""
    # Verify user exists
    user = db.query(User).filter(User.id == alert.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_alert = Alerts(
        user_id=alert.user_id,
        type=alert.type,
        message=alert.message
    )
    try:
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        return db_alert
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error creating alert")


@router.get("/type/{alert_type}", response_model=List[AlertResponse])
def get_alerts_by_type(alert_type: str, db: Session = Depends(get_db), user_id: int = None):
    """Get alerts filtered by type"""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    alerts = db.query(Alerts).filter(
        Alerts.user_id == user_id,
        Alerts.type == alert_type
    ).order_by(Alerts.created_at.desc()).all()
    return alerts


@router.delete("/{alert_id}")
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    """Delete an alert"""
    db_alert = db.query(Alerts).filter(Alerts.id == alert_id).first()
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    try:
        db.delete(db_alert)
        db.commit()
        return {"message": "Alert deleted successfully"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error deleting alert")


@router.delete("/")
def delete_all_user_alerts(db: Session = Depends(get_db), user_id: int = None):
    """Delete all alerts for a user"""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    try:
        db.query(Alerts).filter(Alerts.user_id == user_id).delete()
        db.commit()
        return {"message": "All alerts deleted successfully"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error deleting alerts")
