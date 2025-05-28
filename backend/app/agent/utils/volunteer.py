from pathlib import Path
import json
from typing import List

from app.agent.schemas.volunteer import Volunteer as AgentVolunteer
from app.agent.schemas.volunteer import Volunteer
from app.agent.schemas.common import Coordinates
from app.agent.schemas.types import StatusType

from app.crud.disaster import (
    get_all_volunteers_by_disaster as fetch_volunteers_backend,
    get_all_volunteer_ids_by_disaster as fetch_volunteer_ids_backend,
)
from app.crud.user import get_user_availability

# def get_all_volunteers_by_disaster(disaster_id: str) -> List[Volunteer]:
#     VOLUNTEERS_FILE = "app/agent/data/volunteers.json"
    
#     if not Path(VOLUNTEERS_FILE).exists():
#         return []
    
#     with open(VOLUNTEERS_FILE, "r") as file:
#         volunteers_data = json.load(file)
    
#     normalized = []
#     for vol in volunteers_data:
#         # Normalize location keys if present
#         loc = vol.get("location")
#         if isinstance(loc, dict):
#             vol["location"] = {
#                 "lat": loc.get("latitude"),
#                 "lng": loc.get("longitude"),
#             }
#         normalized.append(vol)
    
#     return [Volunteer(**vol) for vol in normalized]


# def get_all_volunteer_ids_by_disaster(disaster_id: int) -> List[str]:
#     RESOURCES_FILE = "app/agent/data/volunteers.json"

#     if not Path(RESOURCES_FILE).exists():
#         return []
    
#     with open(RESOURCES_FILE, "r") as file:
#         resources_data = json.load(file)
    
#     ids = list({res["id"] for res in resources_data if "id" in res})
#     return ids


def get_all_volunteers_by_disaster(disaster_id: str) -> List[AgentVolunteer]:
    """
    Fetch full volunteer records for a disaster from Firestore,
    then adapt them into the agent’s Volunteer schema.
    """
    backend = fetch_volunteers_backend(disaster_id)
    if backend is None:
        return []

    agents: List[AgentVolunteer] = []
    for rec in backend:
        # rec is a dict with at least: uid, location_lat, location_lng
        uid = rec.get("uid")
        if uid is None:
            # Skip any record without a UID
            continue

        # Normalize and guard against missing coordinate fields
        lat = rec.get("location_lat")
        lng = rec.get("location_lng")
        if lat is None or lng is None:
            # Skip or handle missing coordinates as needed
            continue

        # look up availability flag
        available = get_user_availability(uid)

        agents.append(
            AgentVolunteer(
                id=uid,
                location=Coordinates(lat=lat, lng=lng),
                status=StatusType.AVAILABLE if available else StatusType.NOT_AVAILABLE,
            )
        )

    return agents

def get_all_volunteer_ids_by_disaster(disaster_id: str) -> List[str]:
    """
    Return just the UIDs of all volunteers in the disaster.
    """
    backend_ids = fetch_volunteer_ids_backend(disaster_id)
    if backend_ids is None:
        # disaster not found
        return []
    return backend_ids