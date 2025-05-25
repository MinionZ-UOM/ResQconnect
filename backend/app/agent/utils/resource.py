from pathlib import Path
from typing import List
import json

from app.agent.schemas.resource import Resource

def get_resources_by_ids_and_type(donor_ids: List[str], resource_type: str) -> List[Resource]:
    RESOURCES_FILE = "app/agent/data/resources.json"

    if not Path(RESOURCES_FILE).exists():
        return []
    
    with open(RESOURCES_FILE, "r") as file:
        resources_data = json.load(file)
    
    matching_resources = [
        Resource(**res)
        for res in resources_data
        if res["donor_id"] in donor_ids and res["resource_type"] == resource_type
    ]
    
    return matching_resources