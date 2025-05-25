from datetime import datetime
from enum import Enum
from pydantic import BaseModel
from typing import List, Optional


class UrgencyLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class TypeOfNeed(str, Enum):
    medical = "medical"
    food = "food"
    rescue = "rescue"
    shelter = "shelter"
    water = "water"
    evacuation = "evacuation"
    other = "other"

class Coordinates(BaseModel):
    latitude: float
    longitude: float

class Request(BaseModel):
    incident_id: Optional[str]
    original_request_text_available: bool
    original_request_text: str
    original_request_voice_available: bool
    original_request_voice: str
    extracted_request_voice: Optional[str] 
    original_request_image_available: bool
    original_request_image: str
    extracted_request_image: Optional[str] 
    coordinates: Optional[Coordinates]
    location_from_coordinates: Optional[str]
    location_from_input: Optional[str]
    urgency: Optional[UrgencyLevel]
    type_of_need: Optional[TypeOfNeed]
    disaster_type: Optional[str]
    affected_people_count: Optional[int]

class TextParserOutput(BaseModel):
    location_from_input: Optional[str]
    urgency: Optional[UrgencyLevel]
    type_of_need: Optional[TypeOfNeed]
    disaster_type: Optional[str]
    affected_people_count: Optional[int]

class Incident(BaseModel):
    incident_id: str
    incident_type: str
    incident_coordinates: Optional[Coordinates]
    incident_location: Optional[str]
    incident_summary: Optional[str]

class Action(str, Enum):
    request_extraction = 'request_extraction'
    incident_assignment = 'incident_assignment'
    task_creation = 'task_creation'

class Observation(BaseModel):
    incident_id: int
    title: str
    description: str
    urgency: UrgencyLevel
    location: Optional[Coordinates]
    photos: Optional[List[str]]
    posted_time: datetime

class ResourceType(str, Enum):
    VEHICLE = "vehicle"
    FOOD = "food"
    MEDICINE = "medicine"
    WATER = "water"
    CLOTHING = "clothing"
    SHELTER = "shelter"
    RESCUE_EQUIPMENT = "rescue_equipment"
    COMMUNICATION_DEVICE = "communication_device"
    POWER_SUPPLY = "power_supply"
    SANITATION_KIT = "sanitation_kit"
    FUEL = "fuel"
    MEDICAL_KIT = "medical_kit"

class Resource(BaseModel):
    resource_type: ResourceType
    quantity: int

class Task(BaseModel):
    name: str
    description: str
    urgency: UrgencyLevel
    resource_requirements: Optional[List[Resource]]
    manpower_requirement: Optional[int]


