from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
import shutil

from app.db.session import get_db
from app.models.document import Document
from app.models.audit_log import AuditLog
from app.models.task import Task
from app.schemas.document import DocumentOut
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Security and validation rules
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".xls", ".xlsx", ".csv", ".zip"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def _validate_task_access(db: Session, task_id: int, current_user: User) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if current_user.role == "manager":
        if task.created_by_id != current_user.id and task.assigned_to_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access this task's workspace")
    elif current_user.role == "employee":
        if task.assigned_to_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access this task's workspace")
    
    return task

@router.post("/upload", response_model=DocumentOut)
def upload_document(
    task_id: int = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Access control
    if task_id:
        _validate_task_access(db, task_id, current_user)
    
    # File validation: Extension check
    base, ext = os.path.splitext(file.filename)
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File type {ext} not allowed. Supported formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # File validation: Size check (max 5MB)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 5MB")

    # Simple versioning logic
    existing_docs = db.query(Document).filter(
        Document.file_name == file.filename,
        Document.task_id == task_id
    ).order_by(Document.version.desc()).all()
    
    version = 1
    if existing_docs:
        version = existing_docs[0].version + 1
        
    # Store each version uniquely on disk so previous versions are not overwritten
    unique_filename = f"{base}_v{version}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    new_doc = Document(
        file_name=file.filename,
        file_path=file_path,
        version=version,
        uploaded_by_id=current_user.id,
        task_id=task_id
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    # Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        action="UPLOAD_DOCUMENT",
        entity="DOCUMENT",
        entity_id=new_doc.id
    )
    db.add(audit)
    db.commit()

    return new_doc

@router.get("/{id}", response_model=DocumentOut)
def get_document(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if doc.task_id:
        _validate_task_access(db, doc.task_id, current_user)
        
    return doc

@router.get("/{id}/download")
def download_document(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if doc.task_id:
        _validate_task_access(db, doc.task_id, current_user)
        
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File content not found on disk")
        
    # Audit Log the download action
    audit = AuditLog(
        user_id=current_user.id,
        action="DOWNLOAD_DOCUMENT",
        entity="DOCUMENT",
        entity_id=doc.id
    )
    db.add(audit)
    db.commit()
    
    return FileResponse(path=doc.file_path, filename=doc.file_name)

@router.get("/task/{task_id}", response_model=List[DocumentOut])
def get_task_documents(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _validate_task_access(db, task_id, current_user)
    docs = db.query(Document).filter(Document.task_id == task_id).all()
    return docs

