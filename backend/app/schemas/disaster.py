# app/schemas/disaster.py
from typing import List
from datetime import datetime
from pydantic import BaseModel, Field

class GeoPoint(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)

class DisasterCreate(BaseModel):
    name: str
    description: str
    location: GeoPoint
    image_urls: List[str] = []

class DisasterResponse(DisasterCreate):
    id: str
    created_at: datetime
    created_by: str
    chat_session_id: str
