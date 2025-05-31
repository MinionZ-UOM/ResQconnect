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
def get_all_nearby_active_disasters(user_location: Coordinates):
    """Returns indices of all nearby active disasters for the user from database"""

    return ['dis-001', 'dis-002']


@mcp.tool()
def get_all_disasters_by_id(user: User, person_id: str):
    """Returns all disasters that a specific person participating from database
       inputs:
            user: authentication token
            person_id: the person we needs to list disasters for
    """

    disasters = {
        'user-001': ['flood', 'landslide'],
        'user-002': ['tsunami', 'cyclone']
    }

    if user.role in ['affected_individual', 'volunteer']:
        if person_id == user.id:
            return disasters.get(person_id.lower(), f"no disasters for {person_id}")
        else:
            return 'sorry, you have no permission for other person disasters'

    else:
        return disasters.get(person_id.lower(), f"no disasters for {person_id}")


@mcp.tool()
def get_all_active_volunteers(user: User):
    """Returns all active volunteers from database"""

    if user.role == 'affected_individual':
        return 'sorry, you have no permission for accessing volunteers'

    return ['vol-001', 'vol-002']


if __name__ == "__main__":
    mcp.run(
        transport="streamable-http",
        port=4201,
    )
