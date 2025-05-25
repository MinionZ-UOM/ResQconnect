import json
from pathlib import Path
from typing import List
from app.agent.schemas.incident import Incident
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
INCIDENTS_FILE = "app/agent/data/incidents.json"

# Load incidents from file
def load_incidents() -> List[Incident]:
    if not Path(INCIDENTS_FILE).exists():
        return []
    with open(INCIDENTS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [Incident(**item) for item in data]

# Add a new incident to file
def add_incident(new_incident: Incident):
    incidents = load_incidents()
    incidents.append(new_incident)
    with open(INCIDENTS_FILE, "w", encoding="utf-8") as f:
        json.dump([i.dict() for i in incidents], f, indent=4)

def get_incident_by_id(incident_id: int) -> Incident | None:
    incidents = load_incidents()
    for incident in incidents:
        if incident.incident_id == incident_id:
            return incident
    return None

def get_nearest_incidents(request: Request, top_n: int = 2) -> List[Incident]:
    print('Inside get_nearest_incidents tool')
    # CRUD to get incidents
    incidents: List[Incident] = load_incidents()

    if not request.coordinates:
        raise ValueError("Request must have coordinates to calculate distance.")

    distances = []
    for incident in incidents:
        if incident.incident_coordinates:
            dist = haversine_distance(
                request.coordinates.latitude,
                request.coordinates.longitude,
                incident.incident_coordinates.latitude,
                incident.incident_coordinates.longitude
            )
            distances.append((incident, dist))

    # Sort by distance and return top_n incidents
    distances.sort(key=lambda x: x[1])
    return [incident for incident, _ in distances[:top_n]]