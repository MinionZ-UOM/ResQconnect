from typing import List, Optional
from app.agent.schemas.types import ResourceType, DonorType, StatusType
from app.agent.schemas.common import Coordinates
from pydantic import BaseModel
from enum import Enum
class Resource(BaseModel):
    donor_id: str
    donor_type: DonorType
    resource_type: ResourceType
    location: Coordinates
    quantity: int
    status: StatusType

class ResourceStatus(str, Enum):
    AVAILABLE = "available"
    NOT_AVAILABLE = "not_available"