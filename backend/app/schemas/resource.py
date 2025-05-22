from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ResourceBase(BaseModel):
    category: str                     # food_pack | medical_kit | vehicle | personnel
    unit: str                         # e.g. 'packs', 'person', 'truck'
    quantity_total: int
    quantity_available: int
    location_lat: float
    location_lng: float
    status: str = "ready"             # ready | en_route | maintenance


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    quantity_available: Optional[int] = None
    status: Optional[str] = None


class Resource(ResourceBase):
    id: str
    custodian_id: str | None = None
    updated_at: datetime

    class Config:
        orm_mode = True
