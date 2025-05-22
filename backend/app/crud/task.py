from datetime import datetime, timezone
from typing import List, Optional

from google.cloud.firestore import DocumentReference
from app.core.firebase import get_db
from app.schemas.task import TaskCreate, TaskStatusUpdate, Task

COLLECTION = "tasks"


def _ref(task_id: str | None = None) -> DocumentReference:
    coll = get_db().collection(COLLECTION)
    return coll.document(task_id) if task_id else coll.document()


def create(obj_in: TaskCreate) -> Task:
    doc = _ref()
    now = datetime.now(timezone.utc)
    data = obj_in.dict()
    data.update(
        {
            "status": "pending",
            "created_at": now,
            "updated_at": now,
        }
    )
    doc.set(data)
    return Task(id=doc.id, **data)


def get(task_id: str) -> Optional[Task]:
    snap = _ref(task_id).get()
    return Task(id=snap.id, **snap.to_dict()) if snap.exists else None


def list_all() -> List[Task]:
    return [Task(id=s.id, **s.to_dict()) for s in get_db().collection(COLLECTION).stream()]


def list_by_assignee(uid: str) -> List[Task]:
    qs = (
        get_db()
        .collection(COLLECTION)
        .where("assigned_to", "==", uid)
        .stream()
    )
    return [Task(id=s.id, **s.to_dict()) for s in qs]


def update_status(task_id: str, obj_in: TaskStatusUpdate) -> Task:
    data = {k: v for k, v in obj_in.dict().items() if v is not None}
    data["updated_at"] = datetime.now(timezone.utc)
    _ref(task_id).update(data)
    return get(task_id)
