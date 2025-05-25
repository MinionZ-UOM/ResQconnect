from typing import Optional
from app.agent.schemas.common import Coordinates
from pydantic import BaseModel

class Disaster(BaseModel):
    disaster_id: str
    disaster_type: str
    disaster_coordinates: Optional[Coordinates]
    disaster_location: Optional[str]
    disaster_summary: Optional[str]