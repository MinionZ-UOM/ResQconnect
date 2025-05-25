from typing import Optional
from app.agent.schemas.common import Coordinates
from pydantic import BaseModel

class Incident(BaseModel):
    incident_id: int
    incident_type: str
    incident_coordinates: Optional[Coordinates]
    incident_location: Optional[str]
    incident_summary: Optional[str]