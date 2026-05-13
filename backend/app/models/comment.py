# backend/app/models/comment.py

from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from . import Base

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    task = relationship("Task", backref="comments")
    user = relationship("User")

    @property
    def user_name(self):
        return self.user.name if self.user else "Unknown"
