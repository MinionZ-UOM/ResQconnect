from typing import List, Optional, Any

from app.crud.task import (
    create_task as _create_task_db,
    get_task as _get_task_db,
    list_tasks as _list_tasks_db,
    list_tasks_by_assignee as _list_tasks_by_assignee_db,
    update_task as _update_task_db,
    update_task_status as _update_task_status_db,
)
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate, Task as DBTask
from app.agent.schemas.task import Task as AgentTaskSchema


_URGENCY_TO_PRIORITY = {
    "high":   1,
    "medium": 2,
    "low":    3,
}


def save_tasks(
    agent_tasks: List[AgentTaskSchema],
    request_obj: Any,
) -> List[AgentTaskSchema]:
    """
    Persist agent-generated Task objects via the CRUD layer.
    - Translates urgency ("high"/"medium"/"low") → priority (1/2/3).
    - source_request_id → request_obj.source_request_id or disaster_id.
    - assigned_to → request_obj.assigned_to or None.
    - is_authorized always False.
    """
    disaster_id = getattr(request_obj, "disaster_id")
    source_req   = getattr(request_obj, "source_request_id", None) or disaster_id
    assigned_to  = getattr(request_obj, "assigned_to", None)

    created = []
    for at in agent_tasks:
        # default to lowest priority if missing or unrecognized
        pri = _URGENCY_TO_PRIORITY.get(
            getattr(at, "urgency", "").lower(),
            3
        )
        tc = TaskCreate(
            source_request_id=source_req,
            priority=pri,
            instructions=getattr(at, "description", None),
            role_required="first_responder",
            resource_ids=[],
            disaster_id=disaster_id,
            is_authorized=False,
            assigned_to=assigned_to,
        )
        created.append(_create_task_db(tc))

    return created


def get_task(task_id: str) -> Optional[DBTask]:
    """Fetch a single task from Firestore by ID."""
    return _get_task_db(task_id)


def list_tasks() -> List[DBTask]:
    """List all tasks."""
    return _list_tasks_db()


def list_tasks_by_assignee(uid: str) -> List[DBTask]:
    """List all tasks assigned to a given user ID."""
    return _list_tasks_by_assignee_db(uid)


def list_tasks_by_disaster(disaster_id: str) -> List[DBTask]:
    """List all tasks for a given disaster."""
    return [t for t in _list_tasks_db() if getattr(t, 'disaster_id', None) == disaster_id]


def update_task(task_id: str, **updates) -> Optional[DBTask]:
    """
    Partially update task fields. Pass in only the fields you wish to modify.
    Example: update_task(id, priority=1, instructions="New text")
    """
    payload = TaskUpdate(**updates)
    return _update_task_db(task_id, payload)


def update_task_status(task_id: str, status: TaskStatusUpdate) -> Optional[DBTask]:
    """
    Update only status and/or ETA for a task.
    """
    return _update_task_status_db(task_id, status)
