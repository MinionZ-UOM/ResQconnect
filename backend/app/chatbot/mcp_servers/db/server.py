from fastmcp import FastMCP
from schemas.user import User, Coordinates
from schemas.request import Location, Request
from schemas.task import Task

from typing import List, Optional
from firebase_admin import firestore
from datetime import datetime, timezone
from google.cloud.firestore import DocumentReference, GeoPoint

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
def get_all_volunteer_ids_by_disaster_name(user: User, disaster_name: str) -> Optional[List[str]] | str:
    """
    Return list of UIDs for volunteers (role='volunteer') in a disaster by its name.
    - Returns None if the disaster does not exist.
    """
    if user.role in ['first_responder', 'admin']:
        # Step 1: Fetch disaster ID from disaster name
        disaster_query = db.collection("disasters").where("name", "==", disaster_name).limit(1)
        disaster_snaps = disaster_query.stream()
        disaster_id = None
        for disaster_snap in disaster_snaps:
            disaster_data = disaster_snap.to_dict()
            if disaster_data:
                disaster_id = disaster_snap.id  # Assuming Firestore doc ID is the disaster ID
            break

        if not disaster_id:
            return None

        # Step 2: Query volunteer participant IDs from sub-collection
        doc_ref = db.collection("disasters").document(disaster_id)
        volunteer_docs = (
            doc_ref.collection("participants")
            .where("role", "==", "volunteer")
            .stream()
        )
        volunteer_ids = [v.id for v in volunteer_docs]
        return volunteer_ids
    else:
        return f'User role {user.role} has no permission to this data'



@mcp.tool()
def list_all_latest_requests(user: User):
    """Lists all latest requests in the database"""
    if user.role == 'affected_individual':
        return f'User role {user.role} has no permission to this data'
    else:
        requests = []
        for snap in db.collection("requests").stream():
            d = snap.to_dict()
            print(d)
            gp = d["location"]
            location = Location(lat=gp.latitude, lng=gp.longitude)
            d["location"] = location
            requests.append(Request(id=snap.id, **d))
        requests.sort(key=lambda r: r.created_at, reverse=True)
        if len(requests)>5:
            return requests[:5]
        else:
            return requests

@mcp.tool()
def list_all_latest_requests_by_disaster_name(user: User, disaster_name: str):
    """
    Lists all latest requests for the specified disaster name in the database.
    """
    if user.role == 'affected_individual':
        return f'User role {user.role} has no permission to this data'
    else:
        # Step 1: Fetch disaster ID from disaster name
        disaster_query = db.collection("disasters").where("name", "==", disaster_name).limit(1)
        disaster_snaps = disaster_query.stream()
        disaster_id = None
        for disaster_snap in disaster_snaps:
            disaster_data = disaster_snap.to_dict()
            if disaster_data:
                disaster_id = disaster_snap.id  # Assuming Firestore doc ID is the disaster ID
            break
        
        if not disaster_id:
            return f"No disaster found with name: {disaster_name}"
        
        # Step 2: Fetch requests using disaster_id
        requests = []
        for snap in db.collection("requests").where("disaster_id", "==", disaster_id).stream():
            d = snap.to_dict()
            print(d)
            gp = d["location"]
            location = Location(lat=gp.latitude, lng=gp.longitude)
            d["location"] = location
            requests.append(Request(id=snap.id, **d))

        
        # Sort and limit to 5
        requests.sort(key=lambda r: r.created_at, reverse=True)
        requests = [{'description':request.description, 'location':request.location} for request in requests]
        return requests[:5] if len(requests) > 5 else requests


@mcp.tool()        
def list_tasks_by_assignee_name(user: User, assigned_to_name: str):
    """
    List all disaster related tasks assigned to a particular user.
    """
    if user.role == 'affected_individual':
        return "You don't have access to tasks data"
    elif user.role == 'volunteer':
        if user.name == assigned_to_name:
            qs = db.collection('tasks').where("assigned_to", "==", assigned_to_name).stream()
            tasks = [Task(id=s.id, **s.to_dict()) for s in qs]
            return [task.instructions for task in tasks]
        else:
            return "You don't have permission to access other person's tasks"
    else:
        qs = db.collection('tasks').where("assigned_to", "==", assigned_to_name).stream()
        tasks = [Task(id=s.id, **s.to_dict()) for s in qs]
        return [task.instructions for task in tasks]
    
@mcp.tool()
def list_tasks_by_disaster_name(user: User, disaster_name: str):
    """
    Fetch all tasks whose `disaster_id` matches the ID of the given disaster_name,
    and return them as fully-validated Task objects.
    """
    if user.role in ['volunteer', 'affected_individual']:
        return 'You do not have permission to access this data'
    else:
        # Step 1: Fetch disaster ID from disaster name
        disaster_query = db.collection("disasters").where("name", "==", disaster_name).limit(1)
        disaster_snaps = disaster_query.stream()
        disaster_id = None
        for disaster_snap in disaster_snaps:
            disaster_data = disaster_snap.to_dict()
            if disaster_data:
                disaster_id = disaster_snap.id  # Assuming Firestore doc ID is the disaster ID
            break
        
        if not disaster_id:
            return f"No disaster found with name: {disaster_name}"
        
        # Step 2: Fetch tasks using disaster_id
        query = (
            db.collection("tasks")
            .where("disaster_id", "==", disaster_id)
            .where("is_authorized", "==", True)
        )
        snaps = query.stream()

        results: List[Task] = []
        for snap in snaps:
            data = snap.to_dict() or {}
            task = Task(id=snap.id, **data)
            results.append(task)
        returning = [{'instructions':task.instructions, 'assigned_to':task.assigned_to, 'status':task.status} for task in results]
        print(returning)
        return returning
    

if __name__ == "__main__":
    mcp.run(
        transport="streamable-http",
        port=4201,
    )
