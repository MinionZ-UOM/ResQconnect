from pydantic import BaseModel, Field

class Coordinates( BaseModel):
    latitude: float
    longitude: float

class User(BaseModel):
    id: str
    name: str
    role: str
    location: Coordinates