from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

from .common import Location


class RequestBase(BaseModel):
    disaster_id: str = Field(
        ...,
        description="Identifier for the associated disaster event",
        example="disaster_1234"
    )
    type_of_need: str = Field(
        ...,
        examples=["food", "medical", "rescue", "other"],
    )
    description: Optional[str] = Field(
        None,
        description="Optional detailed description of the request"
    )
    media_urls: List[str] = Field(
        default_factory=list,
        description="List of URLs for supporting media (photos, videos)"
    )
    location: Location = Field(
        ..., description="Geospatial location of the need"
    )
    auto_extract: Optional[Dict[str, Any]] = Field(
        None,
        description="Results from automated extraction (NLP/VLM outputs)"
    )


class RequestCreate(RequestBase):
    """
    Schema used when creating a new Request. Inherits disaster_id and all fields from RequestBase.
    """
    pass


class RequestStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        examples=["in_progress", "fulfilled", "closed"],
        description="New status for the request"
    )
    assigned_task_id: Optional[str] = Field(
        None,
        description="Identifier for an associated workflow/task, if any"
    )


class Request(RequestBase):
    id: str = Field(..., description="Unique identifier for the request")
    created_by: str = Field(..., description="User ID of the creator")
    status: str = Field(
        default="open",
        description="Current status of the request"
    )
    assigned_task_id: Optional[str] = Field(
        None,
        description="Identifier for an associated workflow/task, if any"
    )
    created_at: datetime = Field(
        ..., description="Timestamp when the request was created"
    )
    updated_at: datetime = Field(
        ..., description="Timestamp when the request was last updated"
    )

    class Config:
        orm_mode = True
