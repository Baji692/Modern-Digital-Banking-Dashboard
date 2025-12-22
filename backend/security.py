from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


import bcrypt
import random

def generate_otp():
    return str(random.randint(100000, 999999))

def hash_otp(otp: str):
    return bcrypt.hashpw(otp.encode(), bcrypt.gensalt()).decode()

def verify_otp(otp: str, hashed: str):
    return bcrypt.checkpw(otp.encode(), hashed.encode())
