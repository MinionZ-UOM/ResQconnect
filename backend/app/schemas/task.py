from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TaskBase(BaseModel):
    source_request_id: str
    priority: int = 3                     # 1-High, 2-Med, 3-Low
    instructions: str | None = None
    role_required: str = "first_responder"
    resource_ids: List[str] = []          # inventory linkage


class TaskCreate(TaskBase):
    assigned_to: str | None = None        # uid of volunteer / responder


class TaskStatusUpdate(BaseModel):
    status: str                           # pending | on_route | completed | failed
    eta_minutes: Optional[int] = None


class Task(TaskBase):
    id: str
    assigned_to: str | None = None
    status: str = "pending"
    eta_minutes: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
