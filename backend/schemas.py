from pydantic import BaseModel, Field, EmailStr

class RegisterUser(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str = Field(
        pattern=r"^[6-9]\d{9}$",
        description="Indian phone number (10 digits)"
    )


class LoginUser(BaseModel):
    email: EmailStr
    password: str

class ForgotPassword(BaseModel):
    email: EmailStr
    
from pydantic import BaseModel, EmailStr

class ForgotPassword(BaseModel):
    email: EmailStr

class VerifyOtp(BaseModel):
    email: EmailStr
    otp: str

class ResetPassword(BaseModel):
    email: EmailStr
    new_password: str


from pydantic import BaseModel, EmailStr

class SendRegisterOTP(BaseModel):
    email: EmailStr

class VerifyRegisterOTP(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    otp: str

# schemas.py
from pydantic import BaseModel, EmailStr, Field


class ResetPassword(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)
