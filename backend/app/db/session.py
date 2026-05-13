from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


def _connect_args(url: str) -> dict:
    if url.startswith("sqlite:///"):
        return {"check_same_thread": False}
    return {}


engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    connect_args=_connect_args(settings.DATABASE_URL),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

