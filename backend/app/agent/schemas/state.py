from pydantic import BaseModel
from typing import List, Optional
from app.agent.schemas.all import (Action, Request, Incident, Task)

class State(BaseModel):
    previous_action: Optional[Action]
    next_action: Optional[Action]
    request: Optional[Request]
    incident: Optional[Incident]
    tasks: Optional[List[Task]]