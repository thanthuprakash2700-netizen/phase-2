# backend/app/api/routers/dashboard.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.db.session import get_db
from app.api import deps
from app.models.user import User
from app.models.task import Task, StatusEnum
from app.models.approval import Approval, ApprovalStatus
from app.schemas.dashboard import DashboardSummary, TaskDistribution, PerformanceInsight

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # Total tasks
    total_tasks = db.query(Task).count()
    
    # Tasks by status
    status_counts = db.query(Task.status, func.count(Task.id)).group_by(Task.status).all()
    tasks_by_status = {status.value: count for status, count in status_counts}
    
    # Ensure all statuses are present
    for s in StatusEnum:
        if s.value not in tasks_by_status:
            tasks_by_status[s.value] = 0
            
    # Pending approvals
    pending_approvals = db.query(Approval).filter(Approval.status == ApprovalStatus.pending).count()
    
    # Completed tasks
    completed_tasks = tasks_by_status.get(StatusEnum.done.value, 0)
    
    return {
        "total_tasks": total_tasks,
        "tasks_by_status": tasks_by_status,
        "pending_approvals": pending_approvals,
        "completed_tasks": completed_tasks
    }

@router.get("/task-distribution", response_model=List[TaskDistribution])
def get_task_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    status_counts = db.query(Task.status, func.count(Task.id)).group_by(Task.status).all()
    return [{"status": status.value, "count": count} for status, count in status_counts]

@router.get("/performance", response_model=List[PerformanceInsight])
def get_performance_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role not in ["admin", "manager"]:
        return []

    # Count completed tasks per user
    results = db.query(
        User.name, 
        func.count(Task.id).label("completed_count")
    ).join(Task, Task.assigned_to_id == User.id)\
     .filter(Task.status == StatusEnum.done)\
     .group_by(User.name)\
     .all()
    
    return [{"user_name": r.name, "completed_count": r.completed_count} for r in results]
