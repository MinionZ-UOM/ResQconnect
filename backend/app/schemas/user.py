from pydantic import BaseModel
from typing import List, Optional


class Role(BaseModel):
    id: str
    name: str
    permissions: List[str]


class User(BaseModel):
    uid: str
    email: str
    display_name: Optional[str] = None
    role_id: str
    role: Optional[Role] = None
