# backend/app/models/user.py

"""User model definition.

Fields:
- id: primary key
- name: user name
- email: unique email address
- hashed_password: bcrypt hashed password
- role: admin / manager / employee
- is_active: boolean flag
- created_at / updated_at timestamps
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from . import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # admin, manager, employee
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
