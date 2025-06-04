from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, Extra

class Location(BaseModel):
    """Simple lat/lng pair for API payloads & responses."""
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)

class Media(BaseModel):
    url: str = Field(..., description="CDN URL of the uploaded media")
    file_id: str = Field(..., description="ImageKit file identifier")
    name: Optional[str] = Field(None, description="Original file name")
    size: Optional[int] = Field(None, description="Size in bytes")
    width: Optional[int] = Field(None, description="Pixel width")
    height: Optional[int] = Field(None, description="Pixel height")

class Request(BaseModel):
    id: str
    # disaster_id: Optional[str] = Field(
    #     ..., description="Identifier for the associated disaster event", example="disaster_1234"
    # )
    type_of_need: str = Field(..., examples=["food", "medical", "rescue", "other"])
    description: Optional[str] = Field(None, description="Optional detailed description of the request")
    media: List[Media] = Field(
        default_factory=list, description="List of metadata for each uploaded media"
    )
    location: Location = Field(..., description="Geospatial location of the need")
    auto_extract: Optional[Dict[str, Any]] = Field(None, description="Results from automated extraction")
    created_by: str
    status: str = Field(default="open")
    assigned_task_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        extra = Extra.ignore