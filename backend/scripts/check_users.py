# backend/scripts/check_users.py

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.user import User

def check():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for u in users:
            print(f"ID: {u.id}, Name: {u.name}, Email: {u.email}, Role: {u.role}")
    finally:
        db.close()

if __name__ == "__main__":
    check()
