from pathlib import Path
from typing import List

from app.crud.resource import get_resources_by_ids_and_type as fetch_resources
from typing import List
from app.agent.schemas.resource import Resource as AgentResource, ResourceStatus
from app.agent.schemas.types import ResourceType as AgentResType, DonorType, StatusType
from app.agent.schemas.common import Coordinates

from app.utils.logger import get_logger
logger = get_logger(__name__)

# def get_resources_by_ids_and_type(donor_ids: List[str], resource_type: str) -> List[Resource]:
#     RESOURCES_FILE = "app/agent/data/resources.json"

#     if not Path(RESOURCES_FILE).exists():
#         return []
    
#     with open(RESOURCES_FILE, "r") as file:
#         resources_data = json.load(file)
    
#     matching_resources = [
#         Resource(**res)
#         for res in resources_data
#         if res["donor_id"] in donor_ids and res["resource_type"] == resource_type
#     ]
    
#     return matching_resources

def get_resources_by_ids_and_type(
    donor_ids: List[str],
    resource_type: str
) -> List[AgentResource]:
    # call into Firestore-backed CRUD
    backend_resources = fetch_resources(donor_ids, resource_type)
    logger.debug(f'Fetched backend resources {backend_resources}')

    agent_resources: List[AgentResource] = []
    for br in backend_resources:
        # map Firestore AVAILABLE → "active", everything else → "inactive"
        status_str = "active" if br.status == ResourceStatus.AVAILABLE else "inactive"

        agent_resources.append(
            AgentResource(
                donor_id=br.uid,
                donor_type=DonorType(br.role_id),           # assumes role_id matches DonorType enums
                resource_type=AgentResType(br.category),    # category is a ResourceType str
                location=Coordinates(
                    lat=br.location_lat,
                    lng=br.location_lng
                ),
                quantity=br.quantity_available,
                status=status_str,
            )
        )
    return agent_resources