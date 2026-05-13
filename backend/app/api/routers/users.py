from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserOut


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=list[UserOut], dependencies=[Depends(require_roles("admin", "manager"))])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id.asc()).all()


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return user

