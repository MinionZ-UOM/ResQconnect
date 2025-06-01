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


# def get_all_volunteers_by_disaster(disaster_id: str) -> List[AgentVolunteer]:
#     """
#     Fetch full volunteer records for a disaster from Firestore,
#     then adapt them into the agent’s Volunteer schema.
#     """
#     backend = fetch_volunteers_backend(disaster_id)
#     if backend is None:
#         return []

#     agents: List[AgentVolunteer] = []
#     for rec in backend:
#         uid = rec.get("uid")
#         if uid is None:
#             continue

#         lat = rec.get("location_lat")
#         lng = rec.get("location_lng")
#         if lat is None or lng is None:
#             continue

#         # look up availability flag
#         available = get_user_availability(uid)
#         # map available → "active", else → "inactive"
#         status_str = "active" if available else "inactive"

#         agents.append(
#             AgentVolunteer(
#                 id=uid,
#                 location=Coordinates(lat=lat, lng=lng),
#                 status=status_str,
#             )
#         )

#     return agents

def get_all_volunteers_by_disaster(disaster_id: str) -> List[AgentVolunteer]:
    """
    Fetch full volunteer records for a disaster from Firestore,
    then adapt them into the agent’s Volunteer schema.
    """
    print(f"[DEBUG] app/agent/utils/volunteer - Fetching volunteers for disaster_id: {disaster_id}")
    backend = fetch_volunteers_backend(disaster_id)
    if backend is None:
        print(f"[DEBUG] app/agent/utils/volunteer - No volunteers found for disaster_id: {disaster_id}")
        return []

    agents: List[AgentVolunteer] = []
    print(f"[DEBUG] app/agent/utils/volunteer - Processing {len(backend)} volunteer records.")

    for rec in backend:
        uid = rec.get("uid")
        if uid is None:
            print(f"[DEBUG] app/agent/utils/volunteer - Skipping record without UID: {rec}")
            continue

        lat = rec.get("location_lat")
        lng = rec.get("location_lng")
        if lat is None or lng is None:
            print(f"[DEBUG] app/agent/utils/volunteer - Skipping record with missing location for UID: {uid}")
            continue

        available = get_user_availability(uid)
        status_str = "active" if available else "inactive"
        print(f"[DEBUG] app/agent/utils/volunteer - UID: {uid}, Availability: {available}, Status: {status_str}")

        agents.append(
            AgentVolunteer(
                id=uid,
                location=Coordinates(lat=lat, lng=lng),
                status=status_str,
            )
        )
        print(f"[DEBUG] app/agent/utils/volunteer - Volunteer added: UID: {uid}, Location: ({lat}, {lng}), Status: {status_str}")

    print(f"[DEBUG] app/agent/utils/volunteer - Total volunteers processed: {len(agents)}")
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