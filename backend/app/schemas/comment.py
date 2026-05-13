# backend/app/schemas/comment.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class CommentBase(BaseModel):
    content: str
    is_internal: bool = False

class CommentCreate(CommentBase):
    pass

class CommentOut(CommentBase):
    id: int
    task_id: int
    user_id: int
    user_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
