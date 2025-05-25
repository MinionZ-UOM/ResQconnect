from app.agent.schemas.types import StatusType
from app.agent.schemas.common import Coordinates
from pydantic import BaseModel

class Volunteer(BaseModel):
    id: str
    location: Coordinates
    status: StatusType