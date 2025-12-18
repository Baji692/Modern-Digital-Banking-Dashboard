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
