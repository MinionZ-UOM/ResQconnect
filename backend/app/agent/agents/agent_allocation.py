from app.agent.core.base_agent import BaseAgent
from app.agent.schemas.state import State
from app.agent.schemas.types import AcceptedType, Action
from app.agent.utils.disaster import get_disaster_by_id, haversine_distance
from app.agent.utils.location import get_location
from app.agent.utils.request import analyse_image, parse_text, stt
from app.agent.utils.volunteer import get_all_volunteer_ids_by_disaster, get_all_volunteers_by_disaster
from app.agent.utils.resource import get_resources_by_ids_and_type
from app.agent.schemas.resource import Resource
from app.agent.schemas.task import ResourceAllocation, TaskAllocation, VolunteerAllocation
from app.agent.utils.admin import get_admin_ids

from app.utils.logger import get_logger
logger = get_logger(__name__)


class AgentAllocation(BaseAgent):
    def handle(self, state: State) -> State:
        logger.info('Inside allocation agent')
        logger.debug(f'Processing disaster ID: {state.disaster.disaster_id}')

        volunteer_ids = get_all_volunteer_ids_by_disaster(state.disaster.disaster_id)
        logger.debug(f'Retrieved volunteer IDs: {volunteer_ids}')

        admin_ids = get_admin_ids()
        logger.debug(f"Retrieved admin IDs: {admin_ids}")

        resource_provider_ids = admin_ids + volunteer_ids
        
        task_allocations = []
        assigned_volunteer_ids = set()

        for task in state.tasks:

            resource_allocations = []
            volunteer_allocations = []

            # Convert requirements to dict
            resource_requirements = {
                req.resource_type.value: req.quantity
                for req in task.resource_requirements
            }
            manpower_requirements = task.manpower_requirement
            logger.debug(f"Resource Requirements: {resource_requirements}")
            logger.debug(f"Manpower Requirement: {manpower_requirements}")

            # -------- RESOURCE ALLOCATION --------
            for resource_type, quantity_required in resource_requirements.items():
                logger.debug(f"Allocating Resource Type: {resource_type} (Quantity Required: {quantity_required})")

                available_resources = [
                    resource for resource in get_resources_by_ids_and_type(resource_provider_ids, resource_type)
                    if resource.status == 'active' and resource.quantity > 0
                ]
                logger.debug(f"Available resources found: {len(available_resources)}")
                logger.debug(f"Available resources found: {available_resources}")

                sorted_resources = sorted(
                    available_resources,
                    key=lambda r: haversine_distance(
                        state.disaster.disaster_coordinates.latitude,
                        state.disaster.disaster_coordinates.longitude,
                        r.location.latitude,
                        r.location.longitude
                    )
                )

                allocated_quantity = 0
                for resource in sorted_resources:
                    if allocated_quantity >= quantity_required:
                        break

                    allocatable_quantity = min(
                        resource.quantity, quantity_required - allocated_quantity
                    )
                    if allocatable_quantity > 0:
                        partial_resource = Resource(
                            donor_id=resource.donor_id,
                            donor_type=resource.donor_type,
                            resource_type=resource.resource_type,
                            location=resource.location,
                            quantity=allocatable_quantity,
                            status=resource.status
                        )

                        allocation = ResourceAllocation(
                            resource=partial_resource,
                            accepted=AcceptedType.PENDING
                        )
                        resource_allocations.append(allocation)
                        allocated_quantity += allocatable_quantity

                        # logger.debug(f"Allocated {allocatable_quantity} units from resource ID: {resource.id}")

                logger.debug(f"Total allocated quantity for {resource_type}: {allocated_quantity}")
                logger.debug(f"Resource Allocations: {resource_allocations}")

            # -------- VOLUNTEER (MANPOWER) ALLOCATION --------
            logger.debug(f"Allocating volunteers for manpower requirement: {manpower_requirements}")

            all_volunteers = get_all_volunteers_by_disaster(state.disaster.disaster_id)
            logger.debug(f"All volunteers found: {len(all_volunteers)}")

            available_volunteers = [
                v for v in all_volunteers
                if v.id in volunteer_ids and v.status == 'active' and v.id not in assigned_volunteer_ids
            ]
            logger.debug(f"Available volunteers after filtering: {len(available_volunteers)}")

            sorted_volunteers = sorted(
                available_volunteers,
                key=lambda v: haversine_distance(
                    state.disaster.disaster_coordinates.latitude,
                    state.disaster.disaster_coordinates.longitude,
                    v.location.latitude,
                    v.location.longitude
                )
            )

            for volunteer in sorted_volunteers[:manpower_requirements]:
                allocation = VolunteerAllocation(
                    volunteer=volunteer,
                    accepted=AcceptedType.PENDING
                )
                volunteer_allocations.append(allocation)
                assigned_volunteer_ids.add(volunteer.id)
                logger.debug(f"Assigned Volunteer ID: {volunteer.id}")

            logger.debug(f"Total volunteers allocated: {len(volunteer_allocations)}")
            logger.debug(f"Volunteer Allocations: {volunteer_allocations}")

            # Store allocations
            task_allocations.append(TaskAllocation(
                task=task,
                resource_allocations=resource_allocations,
                volunteer_allocations=volunteer_allocations
            ))
            # logger.debug(f"Finished allocations for Task ID: {task.id}")

        state.task_allocations = task_allocations
        logger.debug("Allocation process complete. Returning updated state.")
        return state