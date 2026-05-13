# backend/scripts/seed.py

import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password

def seed():
    db = SessionLocal()
    try:
        users = [
            {
                "name": "Admin User",
                "email": "admin@example.com",
                "password": "adminpassword123",
                "role": "admin",
            },
            {
                "name": "Manager User",
                "email": "manager@example.com",
                "password": "managerpassword123",
                "role": "manager",
            },
            {
                "name": "Employee User",
                "email": "employee@example.com",
                "password": "employeepassword123",
                "role": "employee",
            },
        ]

        for u in users:
            exists = db.query(User).filter(User.email == u["email"]).first()
            if not exists:
                user = User(
                    name=u["name"],
                    email=u["email"],
                    hashed_password=hash_password(u["password"]),
                    role=u["role"],
                    is_active=True,
                )
                db.add(user)
                print(f"Added user: {u['email']}")
            else:
                print(f"User {u['email']} already exists.")
        
        db.commit()
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
