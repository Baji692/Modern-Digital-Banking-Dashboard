# auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

import os

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


# ---------------- JWT CONFIG (SAFE) ----------------

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 60))


def get_jwt_settings():
    secret_key = os.getenv("JWT_SECRET_KEY")
    algorithm = os.getenv("JWT_ALGORITHM", "HS256")

    if not secret_key:
        raise RuntimeError("JWT_SECRET_KEY is not set in .env")

    return secret_key, algorithm


def create_access_token(data: dict):
    SECRET_KEY, ALGORITHM = get_jwt_settings()

    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


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

    access_token = create_access_token(
        data={
            "user_id": db_user.id,
            "email": db_user.email,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "kyc_status": db_user.kyc_status,
        },
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
# RESET PASSWORD (FINAL – HARDENED)
# =====================================================
@router.post("/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):

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

    if otp_row.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    if not verify_otp(data.otp, otp_row.otp_hash):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if verify_password(data.new_password, user.password):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from old password",
        )

    otp_row.is_used = True
    user.password = hash_password(data.new_password)

    db.commit()

    return {"message": "Password reset successful"}


# =====================================================
# JWT AUTH DEPENDENCY (USED BY ROUTES)
# =====================================================

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    try:
        SECRET_KEY, ALGORITHM = get_jwt_settings()
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id: int | None = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token",
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user
