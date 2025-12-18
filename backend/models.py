from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP
from database import Base
import enum

class KycStatus(enum.Enum):
    unverified = "unverified"
    verified = "verified"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    phone = Column(String)
    kyc_status = Column(Enum(KycStatus), default=KycStatus.unverified)
    created_at = Column(TIMESTAMP)
