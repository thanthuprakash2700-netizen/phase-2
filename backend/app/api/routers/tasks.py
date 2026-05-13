from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.task import Task, StatusEnum
from app.models.user import User
from app.models.comment import Comment
from app.schemas.task import TaskAssign, TaskCreate, TaskOut, TaskUpdate
from app.schemas.comment import CommentCreate, CommentOut


router = APIRouter(prefix="/tasks", tags=["tasks"])


def _get_task_or_404(db: Session, task_id: int) -> Task:
    task = db.query(Task).options(
        joinedload(Task.assignee),
        joinedload(Task.comments).joinedload(Comment.user)
    ).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

def _validate_status_transition(current_status: StatusEnum, new_status: StatusEnum):
    allowed_transitions = {
        StatusEnum.todo: [StatusEnum.in_progress],
        StatusEnum.in_progress: [StatusEnum.review, StatusEnum.todo],
        StatusEnum.review: [StatusEnum.done, StatusEnum.in_progress],
        StatusEnum.done: [StatusEnum.review] # Allow moving back if needed
    }
    if new_status not in allowed_transitions.get(current_status, []):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid transition from {current_status} to {new_status}"
        )


@router.post("/", response_model=TaskOut, status_code=201, dependencies=[Depends(require_roles("admin", "manager"))])
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.assigned_to_id is not None:
        assignee = db.query(User).filter(User.id == payload.assigned_to_id).first()
        if not assignee:
            raise HTTPException(status_code=400, detail="Assigned user does not exist")
        
        # Managers can only assign to employees
        if current_user.role == "manager" and assignee.role != "employee":
            raise HTTPException(status_code=403, detail="Managers can only assign tasks to employees")

    task = Task(
        title=payload.title,
        description=payload.description,
        status=payload.status,
        priority=payload.priority,
        due_date=payload.due_date,
        created_by_id=current_user.id,
        assigned_to_id=payload.assigned_to_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/", response_model=list[TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Task).options(
        joinedload(Task.assignee),
        joinedload(Task.creator)
    )
    if current_user.role == "admin":
        pass
    elif current_user.role == "manager":
        q = q.filter((Task.created_by_id == current_user.id) | (Task.assigned_to_id == current_user.id))
    else:
        q = q.filter(Task.assigned_to_id == current_user.id)
    return q.order_by(Task.id.desc()).all()


@router.get("/kanban", response_model=dict[str, list[TaskOut]])
def get_kanban_board(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tasks = list_tasks(db, current_user)
    board = {status.value: [] for status in StatusEnum}
    for task in tasks:
        board[task.status.value].append(task)
    return board


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_task_or_404(db, task_id)

    if current_user.role == "admin":
        return task
    if current_user.role == "manager":
        if task.created_by_id != current_user.id and task.assigned_to_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden")
        return task
    if task.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return task


@router.put("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_task_or_404(db, task_id)

    if current_user.role == "employee":
        # Employees can only update status (and only for tasks assigned to them)
        if task.assigned_to_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden")
        if payload.status is None:
            raise HTTPException(status_code=400, detail="Employees can only update status")
        task.status = payload.status
    else:
        # Admin/Manager: allow updates, but managers only for relevant tasks
        if current_user.role == "manager" and (
            task.created_by_id != current_user.id and task.assigned_to_id != current_user.id
        ):
            raise HTTPException(status_code=403, detail="Forbidden")

        if payload.title is not None:
            task.title = payload.title
        if payload.description is not None:
            task.description = payload.description
        if payload.status is not None:
            task.status = payload.status
        if payload.priority is not None:
            task.priority = payload.priority
        if payload.due_date is not None:
            task.due_date = payload.due_date

    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204, dependencies=[Depends(require_roles("admin", "manager"))])
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_task_or_404(db, task_id)
    if current_user.role == "manager" and task.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    db.delete(task)
    db.commit()
    return None


@router.patch("/{task_id}/assign", response_model=TaskOut, dependencies=[Depends(require_roles("admin", "manager"))])
def assign_task(
    task_id: int,
    payload: TaskAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_task_or_404(db, task_id)
    if current_user.role == "manager" and task.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    assignee = db.query(User).filter(User.id == payload.assigned_to_id).first()
    if not assignee:
        raise HTTPException(status_code=400, detail="Assigned user does not exist")

    # Managers can only assign to employees
    if current_user.role == "manager" and assignee.role != "employee":
        raise HTTPException(status_code=403, detail="Managers can only assign tasks to employees")

    task.assigned_to_id = assignee.id
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/status", response_model=TaskOut)
def update_task_status(
    task_id: int,
    status_payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_task_or_404(db, task_id)
    new_status_str = status_payload.get("status")
    if not new_status_str:
        raise HTTPException(status_code=400, detail="Status is required")
    
    try:
        new_status = StatusEnum(new_status_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")

    # Validate transition
    _validate_status_transition(task.status, new_status)

    task.status = new_status
    task.updated_by_id = current_user.id
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.post("/{task_id}/comments", response_model=CommentOut)
def add_comment(
    task_id: int,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_task_or_404(db, task_id)
    comment = Comment(
        task_id=task.id,
        user_id=current_user.id,
        content=comment_in.content,
        is_internal=comment_in.is_internal
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

@router.get("/{task_id}/comments", response_model=list[CommentOut])
def get_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_task_or_404(db, task_id)
    # If employee, only show public comments
    if current_user.role == "employee":
        return [c for c in task.comments if not c.is_internal]
    return task.comments
