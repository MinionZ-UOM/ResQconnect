from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

from .common import Location        


class RequestBase(BaseModel):
    type_of_need: str = Field(..., examples=["food", "medical", "rescue", "other"])
    description: Optional[str] = None
    media_urls: List[str] = []
    location: Location                # <-- now a simple object
    auto_extract: Dict[str, Any] | None = None   # NLP / VLM results


class RequestCreate(RequestBase):
    pass


class RequestStatusUpdate(BaseModel):
    status: str = Field(..., examples=["in_progress", "fulfilled", "closed"])
    assigned_task_id: Optional[str] = None


class Request(RequestBase):
    id: str
    created_by: str
    status: str = "open"
    assigned_task_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
