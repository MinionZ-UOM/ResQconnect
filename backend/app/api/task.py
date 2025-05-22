from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.task import TaskCreate, Task, TaskStatusUpdate
from app.schemas.user import User
from app.core.permissions import require_perms
from app.crud import task as crud
from app.api.deps import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


# --- create ---
@router.post(
    "/", response_model=Task, status_code=status.HTTP_201_CREATED,
    dependencies=[require_perms("task:assign")]
)
def create_task(payload: TaskCreate):
    return crud.create(payload)


# --- list ---
@router.get("/", response_model=list[Task], dependencies=[require_perms("task:read_all")])
def list_tasks():
    return crud.list_all()


@router.get("/me", response_model=list[Task], dependencies=[require_perms("task:read_own")],)
def my_tasks(current: User = Depends(get_current_user)):
    return crud.list_by_assignee(current.uid)


# --- detail ---
@router.get("/{task_id}", response_model=Task)
def read_task(
    task_id: str,
    current: User = Depends(get_current_user),
):
    task = crud.get(task_id)
    if not task:
        raise HTTPException(404, "Task not found")

    # AuthZ: allow if read_all or it's assigned to me
    try:
        require_perms("task:read_all")(current)
    except HTTPException:
        if task.assigned_to != current.uid:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Not authorised")

    return task


# -- update status --
@router.patch(
    "/{task_id}/status",
    response_model=Task,
    dependencies=[require_perms("task:update_status")],
)
def update_task_status(task_id: str, payload: TaskStatusUpdate, current: User = Depends(get_current_user)):
    task = crud.get(task_id)
    if not task:
        raise HTTPException(404, "Task not found")

    # owners can always update, others need task:read_all
    if task.assigned_to != current.uid:
        require_perms("task:read_all")(current)

    return crud.update_status(task_id, payload)
