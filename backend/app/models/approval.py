# backend/app/models/approval.py

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from . import Base
import enum

class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    hold = "hold"

class ApprovalLevel(str, enum.Enum):
    manager = "manager"
    admin = "admin"

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    requested_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(50), default=ApprovalStatus.pending, nullable=False)
    current_level = Column(String(50), default=ApprovalLevel.manager, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    requester = relationship("User", foreign_keys=[requested_by_id])
    history = relationship("ApprovalHistory", back_populates="approval", cascade="all, delete-orphan")

    @property
    def requester_name(self):
        return self.requester.name if self.requester else "Unknown"

class ApprovalHistory(Base):
    __tablename__ = "approval_history"

    id = Column(Integer, primary_key=True, index=True)
    approval_id = Column(Integer, ForeignKey("approvals.id"), nullable=False)
    action_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(50), nullable=False)  # approved, rejected, hold
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    approval = relationship("Approval", back_populates="history")
    actor = relationship("User", foreign_keys=[action_by_id])

    @property
    def actor_name(self):
        return self.actor.name if self.actor else "Unknown"
