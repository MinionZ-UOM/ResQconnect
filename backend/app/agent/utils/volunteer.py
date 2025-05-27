from pathlib import Path
import json
from typing import List

from app.agent.schemas.volunteer import Volunteer as AgentVolunteer
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
    
#     return [Volunteer(**vol) for vol in volunteers_data]

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
        uid = rec["uid"]
        # look up availability flag
        available = get_user_availability(uid)
        agents.append(
            AgentVolunteer(
                id=uid,
                location=Coordinates(lat=rec["location_lat"], lng=rec["location_lng"]),
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