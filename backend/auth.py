# auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database import SessionLocal
from models import User, EmailOTP
from schemas import (
    LoginUser,
    ForgotPassword,
    ResetPassword,
    SendRegisterOTP,
    VerifyRegisterOTP,
)
from security import (
    hash_password,
    verify_password,
    generate_otp,
    hash_otp,
    verify_otp,
)
from email_service import send_email

router = APIRouter(tags=["Auth"])


# ---------------- DB ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# REGISTER → SEND OTP
# =====================================================
@router.post("/register/send-otp")
def send_register_otp(data: SendRegisterOTP, db: Session = Depends(get_db)):

    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    otp = generate_otp()

    otp_entry = EmailOTP(
        email=data.email,
        otp_hash=hash_otp(otp),
        purpose="register",
        expires_at=datetime.utcnow() + timedelta(minutes=5),
        is_used=False,
    )

    db.add(otp_entry)
    db.commit()

    send_email(
        to_email=data.email,
        subject="Your FinBank Registration OTP",
        body=f"Your OTP is {otp}. It is valid for 5 minutes.",
    )

    return {"message": "OTP sent to email"}


# =====================================================
# REGISTER → VERIFY OTP & CREATE USER
# =====================================================
@router.post("/register/verify-otp")
def verify_register_otp(data: VerifyRegisterOTP, db: Session = Depends(get_db)):

    otp_row = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.email == data.email,
            EmailOTP.purpose == "register",
            EmailOTP.is_used == False,
        )
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if not otp_row:
        raise HTTPException(status_code=400, detail="OTP not found")

    if otp_row.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    if not verify_otp(data.otp, otp_row.otp_hash):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    otp_row.is_used = True

    new_user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password=hash_password(data.password),
        kyc_status="unverified",
    )

    db.add(new_user)
    db.commit()

    return {"message": "Account created successfully"}


# =====================================================
# LOGIN
# =====================================================
@router.post("/login")
def login(user: LoginUser, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "user_id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "kyc_status": db_user.kyc_status,
    }


# =====================================================
# FORGOT PASSWORD → SEND OTP
# =====================================================
@router.post("/forgot-password")
def forgot_password(data: ForgotPassword, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp = generate_otp()

    otp_entry = EmailOTP(
        email=user.email,
        otp_hash=hash_otp(otp),
        purpose="reset",
        expires_at=datetime.utcnow() + timedelta(minutes=5),
        is_used=False,
    )

    db.add(otp_entry)
    db.commit()

    send_email(
        to_email=user.email,
        subject="FinBank Password Reset OTP",
        body=f"Your OTP is {otp}. It is valid for 5 minutes.",
    )

    return {"message": "OTP sent to email"}


# =====================================================
# RESET PASSWORD (FIXED & HARDENED)
# =====================================================
# =====================================================
# RESET PASSWORD (FINAL – FIXED)
# =====================================================
@router.post("/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):

    # 1️⃣ Find latest unused OTP
    otp_row = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.email == data.email,
            EmailOTP.purpose == "reset",
            EmailOTP.is_used == False,
        )
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if not otp_row:
        raise HTTPException(status_code=400, detail="OTP not found")

    # 2️⃣ Check expiry
    if otp_row.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    # 3️⃣ Verify OTP
    if not verify_otp(data.otp, otp_row.otp_hash):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # 4️⃣ Fetch user
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 5️⃣ Prevent password reuse
    if verify_password(data.new_password, user.password):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from old password",
        )

    # 6️⃣ Commit changes
    otp_row.is_used = True
    user.password = hash_password(data.new_password)

    db.commit()

    return {"message": "Password reset successful"}
