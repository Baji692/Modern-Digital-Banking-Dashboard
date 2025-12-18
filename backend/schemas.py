from pydantic import BaseModel, EmailStr

class RegisterUser(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str | None = None

class LoginUser(BaseModel):
    email: EmailStr
    password: str

class ForgotPassword(BaseModel):
    email: EmailStr
