# backend/app/schemas/task.py

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from ..models.task import StatusEnum, PriorityEnum

class TaskBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    status: StatusEnum = StatusEnum.todo
    priority: PriorityEnum = PriorityEnum.medium
    due_date: Optional[datetime] = None
    assigned_to_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

from ..schemas.comment import CommentOut

class TaskOut(TaskBase):
    id: int
    created_by_id: int
    created_by_name: Optional[str] = None
    assigned_to_name: Optional[str] = None
    updated_by_id: Optional[int] = None
    updated_by_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    comments: List[CommentOut] = []

    class Config:
        from_attributes = True

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[StatusEnum] = None
    priority: Optional[PriorityEnum] = None
    due_date: Optional[datetime] = None
    assigned_to_id: Optional[int] = None

    class Config:
        from_attributes = True

class TaskAssign(BaseModel):
    assigned_to_id: int
