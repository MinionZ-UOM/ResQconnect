from pathlib import Path
import json
from typing import List

from app.agent.schemas.volunteer import Volunteer


def get_all_volunteers_by_incident(incident_id: int) -> List[Volunteer]:
    VOLUNTEERS_FILE = "app/agent/data/volunteers.json"
    
    if not Path(VOLUNTEERS_FILE).exists():
        return []
    
    with open(VOLUNTEERS_FILE, "r") as file:
        volunteers_data = json.load(file)
    
    return [Volunteer(**vol) for vol in volunteers_data]

def get_all_volunteer_ids_by_incident(incident_id: int) -> List[str]:
    RESOURCES_FILE = "app/agent/data/volunteers.json"

    if not Path(RESOURCES_FILE).exists():
        return []
    
    with open(RESOURCES_FILE, "r") as file:
        resources_data = json.load(file)
    
    ids = list({res["id"] for res in resources_data if "id" in res})
    return ids
