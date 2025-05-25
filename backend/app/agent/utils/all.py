from datetime import datetime
import json
from pathlib import Path
from typing import List, Optional
from app.agent.schemas.all import Coordinates, Incident, Observation, Request, TextParserOutput
import instructor
from groq import Groq
import random
from math import radians, sin, cos, sqrt, atan2
from geopy.geocoders import Nominatim
import os

def get_location(coordinates: Coordinates) -> Optional[str]:
    print('Inside get_location tool')
    print(f'lat:{coordinates.latitude}, lon:{coordinates.longitude}')
    
    try:
        geolocator = Nominatim(user_agent="incident-locator")
        location = geolocator.reverse((coordinates.latitude, coordinates.longitude), exactly_one=True, timeout=10)
        return location.address if location else None
    except Exception as e:
        print(f"Error during reverse geocoding: {e}")
        return None

def stt(speech) -> str:
    # should execute proper stt script
    print('Inside stt tool')
    return 'We have been stuck inside the house due to the flood outside'

def analyse_image(image) -> str:
    # should execute the proper image analyzing script
    print('Inside analyse_image tool')
    return 'The image shows the outside is covers with flood water upto the wall level, the cars in the road are fully drown'

def parse_text(prompt) -> TextParserOutput:
    print('Inside parse_text tool')

    # Set up instructor with Groq
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

    # Patch the client with instructor
    instructor_client = instructor.patch(client)

    system_prompt = """
    You are a request parsing agent, your task is to analyse the request related to the disaster and parse it into the required response format.
    """

    parsed_request = instructor_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        response_model=TextParserOutput,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        max_retries=2  # Instructor will retry if validation fails
    )

    for key, value in parsed_request.dict().items():
        print(f"{key}: {value}")

    return parsed_request

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
INCIDENTS_FILE = "app/agent/utils/incidents.json"

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

# File path
OBSERVATIONS_FILE = "app/agent/utils/observations.json"

def load_observations_by_incident_id(incident_id: int, top_k: int) -> List[Observation]:
    print('inside load_observations_by_incident_id tool')
    
    if not Path(OBSERVATIONS_FILE).exists():
        return []

    with open(OBSERVATIONS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    

    # Filter observations by incident_id
    observations = [
        Observation(**item)
        for item in data
        if item["incident_id"] == incident_id
    ]

    # Sort by posted_time descending and return the latest 3
    latest_observations = sorted(
        observations,
        key=lambda obs: obs.posted_time,
        reverse=True
    )[:top_k]

    return latest_observations