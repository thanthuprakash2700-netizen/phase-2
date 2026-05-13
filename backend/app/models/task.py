# backend/app/models/task.py

"""Task model definition.

Fields:
- id: primary key
- title: task title (required)
- description: detailed description
- status: todo / in_progress / done (default: todo)
- priority: low / medium / high (default: medium)
- due_date: optional deadline
- created_by_id: foreign key to users.id
- assigned_to_id: foreign key to users.id (optional)
- created_at / updated_at timestamps
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func, Enum
from sqlalchemy.orm import relationship
from . import Base

import enum

class StatusEnum(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    review = "review"
    done = "done"

class PriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(StatusEnum), default=StatusEnum.todo, nullable=False)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.medium, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    creator = relationship("User", foreign_keys=[created_by_id])
    assignee = relationship("User", foreign_keys=[assigned_to_id])
    updater = relationship("User", foreign_keys=[updated_by_id])

    @property
    def assigned_to_name(self):
        return self.assignee.name if self.assignee else None

    @property
    def created_by_name(self):
        return self.creator.name if self.creator else "Unknown"

    @property
    def updated_by_name(self):
        return self.updater.name if self.updater else None
