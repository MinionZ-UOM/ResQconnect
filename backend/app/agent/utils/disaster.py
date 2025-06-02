import json
from pathlib import Path
from typing import List
from app.agent.schemas.intake import Request
from typing import List, Optional
from app.agent.schemas.disaster import Disaster
from app.agent.schemas.common import Coordinates
from app.schemas.disaster import DisasterCreate
from app.crud.disaster import create_disaster, list_disasters, get_disaster as crud_get_disaster

from math import radians, sin, cos, sqrt, atan2

from app.utils.logger import get_logger
logger = get_logger(__name__)


def haversine_distance(lat1, lon1, lat2, lon2):
    # Radius of Earth in kilometers
    R = 6371.0
    
    # Convert latitude and longitude to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    # Compute differences
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    # Haversine formula
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c  # in kilometers


def load_disasters() -> List[Disaster]:
    """
    Fetch all disasters from Firestore and map them into our agent.Disaster schema.
    """
    responses = list_disasters()
    out: List[Disaster] = []
    for d in responses:
        coords = None
        if getattr(d, "location", None):
            coords = Coordinates(lat=d.location.lat, lng=d.location.lng)
        out.append(
            Disaster(
                disaster_id=d.id,
                disaster_type=d.name,
                disaster_coordinates=coords,
                disaster_location=None,
                disaster_summary=d.description,
            )
        )
    return out


def add_disaster(new_disaster: Disaster):
    # If disaster_coordinates is None, fall back to (0.0, 0.0)
    loc = new_disaster.disaster_coordinates or Coordinates(lat=0.0, lng=0.0)

    # Use loc.latitude and loc.longitude, but pass keys "lat" and "lng"
    payload = DisasterCreate(
        name=new_disaster.disaster_type,
        description=new_disaster.disaster_summary or "",
        location={
            "lat": loc.latitude,
            "lng": loc.longitude,
        },
        image_urls=[],
    )

    # Mark this one as coming from the agent
    create_disaster(payload, is_agent_suggestion=True)


def get_disaster_by_id(disaster_id: str) -> Optional[Disaster]:
    """
    Fetch a single disaster from Firestore by ID.
    """
    d = crud_get_disaster(disaster_id)
    if not d:
        return None
    coords = None
    if getattr(d, "location", None):
        coords = Coordinates(lat=d.location.lat, lng=d.location.lng)
    return Disaster(
        disaster_id=d.id,
        disaster_type=d.name,
        disaster_coordinates=coords,
        disaster_location=None,
        disaster_summary=d.description,
    )


def get_nearest_disasters(request: Request, top_n: int = 2) -> List[Disaster]:
    logger.info('Inside get_nearest_disasters tool')
    # CRUD to get disasters
    disasters: List[Disaster] = load_disasters()

    if not request.coordinates:
        raise ValueError("Request must have coordinates to calculate distance.")

    distances = []
    for disaster in disasters:
        if disaster.disaster_coordinates:
            dist = haversine_distance(
                request.coordinates.latitude,
                request.coordinates.longitude,
                disaster.disaster_coordinates.latitude,
                disaster.disaster_coordinates.longitude
            )
            distances.append((disaster, dist))

    # Sort by distance and return top_n disasters
    distances.sort(key=lambda x: x[1])
    return [disaster for disaster, _ in distances[:top_n]]