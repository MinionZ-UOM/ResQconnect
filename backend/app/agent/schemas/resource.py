from typing import List, Optional
from app.agent.schemas.types import ResourceType, DonorType, StatusType
from app.agent.schemas.common import Coordinates
from pydantic import BaseModel

class Resource(BaseModel):
    donor_id: str
    donor_type: DonorType
    resource_type: ResourceType
    location: Coordinates
    quantity: int
    status: StatusType