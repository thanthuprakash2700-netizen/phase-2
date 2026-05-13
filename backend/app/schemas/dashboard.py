# backend/app/schemas/dashboard.py

from pydantic import BaseModel
from typing import Dict, List

class DashboardSummary(BaseModel):
    total_tasks: int
    tasks_by_status: Dict[str, int]
    pending_approvals: int
    completed_tasks: int

class TaskDistribution(BaseModel):
    status: str
    count: int

class PerformanceInsight(BaseModel):
    user_name: str
    completed_count: int
