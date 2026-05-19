# backend/app/models/__init__.py

"""SQLAlchemy model definitions for the Mini Enterprise Collaboration project.

Expose Base and model classes for convenient imports.
"""

from .base import Base
from .user import User
from .task import Task
from .comment import Comment
from .approval import Approval, ApprovalHistory
from .audit_log import AuditLog
from .document import Document
from .notification import Notification
