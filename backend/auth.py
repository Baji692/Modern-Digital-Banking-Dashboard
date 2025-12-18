from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from schemas import RegisterUser, LoginUser, ForgotPassword
from security import hash_password, verify_password
from sqlalchemy.exc import IntegrityError

# router = APIRouter(prefix="/auth", tags=["Auth"])
router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
def register(user: RegisterUser, db: Session = Depends(get_db)):

    # Check email
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Check phone
    if db.query(User).filter(User.phone == user.phone).first():
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        password=hash_password(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


@router.post("/login")
def login(user: LoginUser, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=401, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "user_id": db_user.id,
        "kyc_status": db_user.kyc_status
    }


@router.post("/forgot-password")
def forgot_password(data: ForgotPassword, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # OTP / email sending will be added later
    return {"message": "Password reset link sent (mock)"}
