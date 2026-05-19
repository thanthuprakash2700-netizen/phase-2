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
from datetime import datetime

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    q = db.query(Task)
    if current_user.role == "manager":
        q = q.filter((Task.created_by_id == current_user.id) | (Task.assigned_to_id == current_user.id))
    elif current_user.role == "employee":
        q = q.filter(Task.assigned_to_id == current_user.id)
        
    # Total tasks
    total_tasks = q.count()
    
    # Tasks by status
    status_counts = db.query(Task.status, func.count(Task.id))
    if current_user.role == "manager":
        status_counts = status_counts.filter((Task.created_by_id == current_user.id) | (Task.assigned_to_id == current_user.id))
    elif current_user.role == "employee":
        status_counts = status_counts.filter(Task.assigned_to_id == current_user.id)
        
    status_counts = status_counts.group_by(Task.status).all()
    tasks_by_status = {status.value: count for status, count in status_counts}
    
    # Ensure all statuses are present
    for s in StatusEnum:
        if s.value not in tasks_by_status:
            tasks_by_status[s.value] = 0
            
    # Pending approvals
    app_q = db.query(Approval).filter(Approval.status == ApprovalStatus.pending)
    if current_user.role == "employee":
        app_q = app_q.filter(Approval.requested_by_id == current_user.id)
    pending_approvals = app_q.count()
    
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
    status_counts = db.query(Task.status, func.count(Task.id))
    if current_user.role == "manager":
        status_counts = status_counts.filter((Task.created_by_id == current_user.id) | (Task.assigned_to_id == current_user.id))
    elif current_user.role == "employee":
        status_counts = status_counts.filter(Task.assigned_to_id == current_user.id)
    status_counts = status_counts.group_by(Task.status).all()
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

@router.get("/ai-summary")
def get_ai_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    q = db.query(Task)
    
    if current_user.role == "manager":
        q = q.filter((Task.created_by_id == current_user.id) | (Task.assigned_to_id == current_user.id))
    elif current_user.role == "employee":
        q = q.filter(Task.assigned_to_id == current_user.id)
        
    # Calculate simple AI-like insights
    pending_tasks = q.filter(Task.status != StatusEnum.done).count()
    high_priority = q.filter(Task.priority == "high", Task.status != StatusEnum.done).count()
    delayed_tasks = q.filter(Task.due_date < datetime.utcnow(), Task.status != StatusEnum.done).count()
    
    insights = []
    if pending_tasks > 0:
        insights.append(f"{pending_tasks} tasks pending")
    if high_priority > 0:
        insights.append(f"{high_priority} high priority tasks pending")
    if delayed_tasks > 0:
        insights.append(f"{delayed_tasks} delayed tasks pending")
        
    if not insights:
        insights.append("All caught up! No pending issues.")
        
    return {"insights": insights}
