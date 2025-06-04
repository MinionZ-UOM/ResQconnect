from typing import List, Optional
from app.agent.schemas.types import AcceptedType, ResourceType, UrgencyLevel
from app.agent.schemas.resource import Resource
from app.agent.schemas.volunteer import Volunteer
from pydantic import BaseModel

class ResourceRequirement(BaseModel):
    resource_type: ResourceType
    quantity: int

class Task(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    urgency: Optional[UrgencyLevel] = None
    resource_requirements: Optional[List[ResourceRequirement]] = None
    manpower_requirement: Optional[int] = None

class ResourceAllocation(BaseModel):
    resource: Resource
    accepted: AcceptedType

class VolunteerAllocation(BaseModel):
    volunteer: Volunteer
    accepted: AcceptedType

class TaskAllocation(BaseModel):
    task: Task
    resource_allocations: Optional[List[ResourceAllocation]]
    volunteer_allocations: Optional[List[VolunteerAllocation]]

