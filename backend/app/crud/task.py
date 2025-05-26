# app/crud/task.py

from datetime import datetime, timezone
from typing import List, Optional

from google.cloud.firestore import DocumentReference
from app.core.firebase import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate, Task

COLLECTION = "tasks"


def _ref(task_id: Optional[str] = None) -> DocumentReference:
    coll = get_db().collection(COLLECTION)
    return coll.document(task_id) if task_id else coll.document()


def create_task(obj_in: TaskCreate) -> Task:
    """
    Create a new Task document from TaskCreate, set initial status and timestamps.
    """
    now = datetime.now(timezone.utc)
    data = obj_in.dict()
    data.update({
        "status": TaskStatusUpdate.schema()["properties"]["status"]["default"] if "default" in TaskStatusUpdate.schema()["properties"]["status"] else "pending",
        "created_at": now,
        "updated_at": now,
    })
    doc = _ref()
    doc.set(data)
    return Task(id=doc.id, **data)


def get_task(task_id: str) -> Optional[Task]:
    """
    Fetch a single Task by ID.
    """
    snap = _ref(task_id).get()
    if not snap.exists:
        return None
    return Task(id=snap.id, **snap.to_dict())


def list_tasks() -> List[Task]:
    """
    List all Tasks in the collection.
    """
    return [
        Task(id=s.id, **s.to_dict())
        for s in get_db().collection(COLLECTION).stream()
    ]


def list_tasks_by_assignee(uid: str) -> List[Task]:
    """
    List all Tasks assigned to a particular UID.
    """
    qs = get_db().collection(COLLECTION).where("assigned_to", "==", uid).stream()
    return [Task(id=s.id, **s.to_dict()) for s in qs]


def update_task(task_id: str, obj_in: TaskUpdate) -> Optional[Task]:
    """
    Apply partial updates to any updatable Task fields.
    """
    updates = obj_in.dict(exclude_unset=True)
    if not updates:
        return get_task(task_id)

    updates["updated_at"] = datetime.now(timezone.utc)
    _ref(task_id).update(updates)
    return get_task(task_id)


def update_task_status(task_id: str, obj_in: TaskStatusUpdate) -> Optional[Task]:
    """
    Update only status and/or ETA of a Task.
    """
    updates = obj_in.dict(exclude_unset=True)
    updates["updated_at"] = datetime.now(timezone.utc)
    _ref(task_id).update(updates)
    return get_task(task_id)
