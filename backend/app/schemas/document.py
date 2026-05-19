from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .user import UserOut

class DocumentBase(BaseModel):
    file_name: str

class DocumentCreate(DocumentBase):
    pass

class DocumentOut(DocumentBase):
    id: int
    file_path: str
    version: int
    uploaded_by_id: int
    task_id: Optional[int]
    created_at: datetime
    uploader: Optional[UserOut] = None

    class Config:
        from_attributes = True
