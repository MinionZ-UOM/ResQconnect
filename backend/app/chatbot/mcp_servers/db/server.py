from fastmcp import FastMCP
from schemas.user import User, Coordinates

from typing import List, Optional
from firebase_admin import firestore
from datetime import datetime, timezone

from utils.firebase import get_db
from schemas.disaster import DisasterCreate, DisasterResponse

db = get_db()

mcp = FastMCP("Db")


@mcp.tool()
def list_all_disasters() -> List[DisasterResponse]:
    """Returns indices of all disasters from database"""
    docs = db.collection("disasters").stream()
    return [DisasterResponse(id=d.id, **d.to_dict()) for d in docs]


@mcp.tool()
def get_all_volunteers_by_disaster(user:User, disaster_id: str) -> Optional[List[dict]]:
    """
    Return full participant records for volunteers (role='volunteer') in a disaster,
    each with a non-null 'display_name' (falling back to UID).
    - Returns None if the disaster does not exist.
    """
    if user.role in ['first_responder', 'admin']:
        doc_ref = db.collection("disasters").document(disaster_id)
        if not doc_ref.get().exists:
            return None

        volunteers: List[dict] = []

        for part_snap in (
            doc_ref.collection("participants")
                .where("role", "==", "volunteer")
                .stream()
        ):
            uid = part_snap.id
            pdata = part_snap.to_dict() or {}

            user_snap = db.collection("users").document(uid).get()
            if user_snap.exists:
                display_name = user_snap.get("display_name") or uid
                location = user_snap.get("location")
                if location:
                    location_lat = location.get('lat')
                    location_lng = location.get('lng')

            else:
                display_name = uid

            volunteers.append({
                "uid": uid,
                "display_name": display_name,
                "location_lat": location_lat,
                "location_lng": location_lng,
                **pdata
            })
        
        return volunteers
    else:
        return f'User role {user.role} has no permission to this data'
    

@mcp.tool()
def get_disaster_locations() -> List[dict]:
    """
    Return a list of all disasters, each with:
      - id: the disaster document ID
      - name: the disaster’s name
      - location: the disaster’s location object (e.g. { latitude, longitude, address })

    If there are no disasters, returns an empty list.
    """
    docs = db.collection("disasters").stream()
    locations_list: List[dict] = []
    for d in docs:
        print(f"[DEBUG] Processing disaster: {d}")
        data = d.to_dict() or {}
        locations_list.append({
            "id": d.id,
            "name": data.get("name"),
            "location": data.get("location")
        })
    return locations_list


@mcp.tool()
def get_all_volunteer_ids_by_disaster(user:User, disaster_id: str) -> Optional[List[str]] | str:
    """
    Return list of UIDs for volunteers (role='volunteer') in a disaster.
    - Returns None if the disaster does not exist.
    """
    if user.role in ['first_responder', 'admin']:
        doc_ref = db.collection("disasters").document(disaster_id)
        snap = doc_ref.get()
        if not snap.exists:
            return None

        # Query volunteer participant IDs from sub-collection
        volunteer_docs = doc_ref.collection("participants") \
            .where("role", "==", "volunteer") \
            .stream()
        volunteer_ids = [v.id for v in volunteer_docs]
        return volunteer_ids
    else:
        return f'User role {user.role} has no permission to this data'
# @mcp.tool()
# def get_all_nearby_active_disasters(user_location: Coordinates):
#     """Returns indices of all nearby active disasters for the user from database"""

#     return ['dis-001', 'dis-002']


# @mcp.tool()
# def get_all_disasters_by_id(user: User, person_id: str):
#     """Returns all disasters that a specific person participating from database
#        inputs:
#             user: authentication token
#             person_id: the person we needs to list disasters for
#     """

#     disasters = {
#         'user-001': ['flood', 'landslide'],
#         'user-002': ['tsunami', 'cyclone']
#     }

#     if user.role in ['affected_individual', 'volunteer']:
#         if person_id == user.id:
#             return disasters.get(person_id.lower(), f"no disasters for {person_id}")
#         else:
#             return 'sorry, you have no permission for other person disasters'

#     else:
#         return disasters.get(person_id.lower(), f"no disasters for {person_id}")


# @mcp.tool()
# def get_all_active_volunteers(user: User):
#     """Returns all active volunteers from database"""

#     if user.role == 'affected_individual':
#         return 'sorry, you have no permission for accessing volunteers'

#     return ['vol-001', 'vol-002']


if __name__ == "__main__":
    mcp.run(
        transport="streamable-http",
        port=4201,
    )
