from typing import List, Optional
from app.agent.schemas.types import ResourceType, UrgencyLevel
from pydantic import BaseModel

class Resource(BaseModel):
    resource_type: ResourceType
    quantity: int

class Task(BaseModel):
    name: str
    description: str
    urgency: UrgencyLevel
    resource_requirements: Optional[List[Resource]]
    manpower_requirement: Optional[int]