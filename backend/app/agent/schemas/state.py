from app.agent.schemas.task import Task, TaskAllocation
from app.agent.schemas.incident import Incident
from app.agent.schemas.intake import Request
from app.agent.schemas.types import Action

from pydantic import BaseModel
from typing import List, Optional


class State(BaseModel):
    previous_action: Optional[Action]
    next_action: Optional[Action]
    request: Optional[Request]
    incident: Optional[Incident]
    tasks: Optional[List[Task]]
    task_allocations: Optional[List[TaskAllocation]]