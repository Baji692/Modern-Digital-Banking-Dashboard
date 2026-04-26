from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    # Truncate to 72 bytes for bcrypt compatibility
    return pwd_context.hash(password[:72])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Truncate to 72 bytes to avoid ValueError on some systems
        return pwd_context.verify(plain_password[:72], hashed_password)
    except Exception as e:
        print(f"Bcrypt verification error: {e}")
        return False


import bcrypt
import random

def generate_otp():
    return str(random.randint(100000, 999999))

def hash_otp(otp: str):
    return bcrypt.hashpw(otp.encode(), bcrypt.gensalt()).decode()

def verify_otp(otp: str, hashed: str):
    return bcrypt.checkpw(otp.encode(), hashed.encode())
