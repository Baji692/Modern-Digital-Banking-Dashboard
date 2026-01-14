from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
from models import AdminLogs, User
from schemas import AdminLogCreate, AdminLogResponse
from typing import List
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin-logs", tags=["admin"])


@router.get("/", response_model=List[AdminLogResponse])
def get_admin_logs(
    db: Session = Depends(get_db),
    admin_id: int = None,
    target_type: str = None,
    days: int = 7
):
    """Get admin logs with optional filters"""
    query = db.query(AdminLogs)

    if admin_id:
        query = query.filter(AdminLogs.admin_id == admin_id)

    if target_type:
        query = query.filter(AdminLogs.target_type == target_type)

    # Filter by recent days
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    query = query.filter(AdminLogs.timestamp >= cutoff_date)

    logs = query.order_by(AdminLogs.timestamp.desc()).all()
    return logs


@router.get("/{log_id}", response_model=AdminLogResponse)
def get_admin_log(log_id: int, db: Session = Depends(get_db)):
    """Get a specific admin log"""
    log = db.query(AdminLogs).filter(AdminLogs.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log


@router.post("/", response_model=AdminLogResponse)
def create_admin_log(log: AdminLogCreate, db: Session = Depends(get_db)):
    """Create a new admin log entry"""
    # Verify admin user exists
    admin = db.query(User).filter(User.id == log.admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin user not found")

    db_log = AdminLogs(
        admin_id=log.admin_id,
        action=log.action,
        target_type=log.target_type,
        target_id=log.target_id
    )
    try:
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error creating log")


@router.get("/admin/{admin_id}", response_model=List[AdminLogResponse])
def get_admin_activity(
    admin_id: int,
    db: Session = Depends(get_db),
    days: int = 30
):
    """Get all activity logs for a specific admin"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    logs = db.query(AdminLogs).filter(
        AdminLogs.admin_id == admin_id,
        AdminLogs.timestamp >= cutoff_date
    ).order_by(AdminLogs.timestamp.desc()).all()

    if not logs:
        return []
    return logs


@router.get("/target/{target_type}/{target_id}", response_model=List[AdminLogResponse])
def get_target_logs(
    target_type: str,
    target_id: int,
    db: Session = Depends(get_db)
):
    """Get all admin actions on a specific target"""
    logs = db.query(AdminLogs).filter(
        AdminLogs.target_type == target_type,
        AdminLogs.target_id == target_id
    ).order_by(AdminLogs.timestamp.desc()).all()

    if not logs:
        return []
    return logs


@router.delete("/{log_id}")
def delete_admin_log(log_id: int, db: Session = Depends(get_db)):
    """Delete an admin log (for cleanup purposes)"""
    db_log = db.query(AdminLogs).filter(AdminLogs.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Log not found")

    try:
        db.delete(db_log)
        db.commit()
        return {"message": "Log deleted successfully"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error deleting log")
