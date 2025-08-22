from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None

    class Config:
        from_attributes = True


class UserCreate(UserBase):
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    hashed_password: str
    full_name: str | None = None
    is_active: bool
    created_at: datetime 

    class Config:
        from_attributes = True


class Config:
    from_attributes = True