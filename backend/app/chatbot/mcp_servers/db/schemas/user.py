from pydantic import BaseModel

class Coordinates( BaseModel):
    latitude: float
    longitude: float

class User(BaseModel):
    id: str
    role: str
    location: Coordinates