from datetime import datetime
from typing import List, Optional
from app.agent.schemas.common import Coordinates
from app.agent.schemas.types import UrgencyLevel
from pydantic import BaseModel


class Observation(BaseModel):
    incident_id: int
    title: str
    description: str
    urgency: UrgencyLevel
    location: Optional[Coordinates]
    photos: Optional[List[str]]
    posted_time: datetime