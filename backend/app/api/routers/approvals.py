# backend/app/api/routers/approvals.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.db.session import get_db
from app.api import deps
from app.models.user import User
from app.models.approval import Approval, ApprovalHistory, ApprovalStatus, ApprovalLevel
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.schemas.approval import ApprovalCreate, ApprovalOut, ApprovalAction, ApprovalHistoryOut

router = APIRouter(prefix="/approvals", tags=["approvals"])

@router.post("/", response_model=ApprovalOut)
def create_approval(
    approval_in: ApprovalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    approval = Approval(
        title=approval_in.title,
        description=approval_in.description,
        requested_by_id=current_user.id,
        status=ApprovalStatus.pending,
        current_level=ApprovalLevel.manager
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)

    audit = AuditLog(user_id=current_user.id, action="CREATE_APPROVAL", entity="APPROVAL", entity_id=approval.id)
    db.add(audit)

    # Notify managers and admins of the new approval request
    managers = db.query(User).filter(User.role.in_(["manager", "admin"])).all()
    for mgr in managers:
        if mgr.id != current_user.id:
            notif = Notification(
                user_id=mgr.id,
                message=f"New approval request '{approval.title}' submitted by {current_user.name}."
            )
            db.add(notif)
            
    db.commit()

    return approval

@router.get("/", response_model=List[ApprovalOut])
def list_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    query = db.query(Approval).options(
        joinedload(Approval.history).joinedload(ApprovalHistory.actor),
        joinedload(Approval.requester)
    )
    
    if current_user.role == "admin":
        return query.all()
    elif current_user.role == "manager":
        return query.all()
    else:
        return query.filter(Approval.requested_by_id == current_user.id).all()

@router.patch("/{id}/action", response_model=ApprovalOut)
def take_approval_action(
    id: int,
    action_in: ApprovalAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Only managers and admins can take actions on approvals")

    approval = db.query(Approval).filter(Approval.id == id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")

    if action_in.action == "rejected" and not action_in.comment:
        raise HTTPException(status_code=400, detail="Rejection requires a comment")

    # Business rule: Employee -> Manager -> Admin (if required)
    # For now, let's simplify: Manager can approve. If Admin is required, they can escalate.
    # We'll just update status based on action.
    
    if action_in.action == "approved":
        if current_user.role == "manager":
            # If it needs admin, move to admin level. Otherwise, mark as approved.
            # For simplicity, let's say manager approval is enough unless it's already at admin level.
            if approval.current_level == ApprovalLevel.manager:
                approval.status = ApprovalStatus.approved # Or move to next level if needed
            else:
                approval.status = ApprovalStatus.approved
        else: # admin
            approval.status = ApprovalStatus.approved
    else:
        approval.status = action_in.action # rejected or hold

    # Record history
    history = ApprovalHistory(
        approval_id=approval.id,
        action_by_id=current_user.id,
        action=action_in.action,
        comment=action_in.comment
    )
    db.add(history)
    
    audit = AuditLog(user_id=current_user.id, action=f"APPROVAL_{action_in.action.upper()}", entity="APPROVAL", entity_id=approval.id)
    db.add(audit)
    
    notif = Notification(user_id=approval.requested_by_id, message=f"Your approval request '{approval.title}' has been {action_in.action}.")
    db.add(notif)
    
    db.commit()
    db.refresh(approval)
    return approval

@router.get("/{id}/history", response_model=List[ApprovalHistoryOut])
def get_approval_history(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    approval = db.query(Approval).filter(Approval.id == id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    # RBAC: Only creator, manager, or admin can see history
    if current_user.role == "employee" and approval.requested_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this approval history")

    return approval.history
