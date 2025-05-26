from pydantic import BaseModel, Field

class Coordinates(BaseModel):
    latitude: float = Field(..., alias="lat")
    longitude: float = Field(..., alias="lng")

    class Config:
        allow_population_by_field_name = True
