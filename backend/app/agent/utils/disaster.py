import json
from pathlib import Path
from typing import List
from app.agent.schemas.disaster import Disaster
from app.agent.schemas.intake import Request
from math import radians, sin, cos, sqrt, atan2

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

# File path
DISASTERS_FILE = "app/agent/data/disasters.json"

# Load disasters from file
def load_disasters() -> List[Disaster]:
    if not Path(DISASTERS_FILE).exists():
        return []
    with open(DISASTERS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [Disaster(**item) for item in data]

# Add a new disaster to file
def add_disaster(new_disaster: Disaster):
    disasters = load_disasters()
    disasters.append(new_disaster)
    with open(DISASTERS_FILE, "w", encoding="utf-8") as f:
        json.dump([i.dict() for i in disasters], f, indent=4)

def get_disaster_by_id(disaster_id: str) -> Disaster | None:
    disasters = load_disasters()
    for disaster in disasters:
        if disaster.disaster_id == disaster_id:
            return disaster
    return None

def get_nearest_disasters(request: Request, top_n: int = 2) -> List[Disaster]:
    print('Inside get_nearest_disasters tool')
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