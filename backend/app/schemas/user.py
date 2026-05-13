# backend/app/schemas/user.py

"""Pydantic schemas for user-related operations.

- `UserCreate`: data required for registration.
- `UserRead`: data returned in responses (excludes password).
- `UserLogin`: credentials for login.
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserBase(BaseModel):
    name: str = Field(..., max_length=255)
    email: EmailStr
    role: str = Field(..., pattern="^(admin|manager|employee)$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
