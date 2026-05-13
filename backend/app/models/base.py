# backend/app/models/base.py

"""SQLAlchemy declarative base for all models.

All model classes should inherit from `Base` defined here.
"""

from sqlalchemy.orm import declarative_base

Base = declarative_base()
