from app.agent.schemas.common import Coordinates
from app.agent.schemas.types import TypeOfNeed, UrgencyLevel
from pydantic import BaseModel
from typing import Optional

class Request(BaseModel):
    disaster_id: Optional[str]
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