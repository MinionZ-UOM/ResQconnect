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


class AgentAllocation(BaseAgent):
    def handle(self, state: State) -> State:
        print('Inside allocation agent')

        ids = get_all_volunteer_ids_by_disaster(state.disaster.disaster_id)
        print("Available volunteer IDs:", ids)

        task_allocations = []
        assigned_volunteer_ids = set()  # ⬅️ Track already assigned volunteers

        for task in state.tasks:
            resource_allocations = []
            volunteer_allocations = []

            # Convert requirements to dict: {resource_type: quantity}
            resource_requirements = {
                req.resource_type.value: req.quantity
                for req in task.resource_requirements
            }
            manpower_requirements = task.manpower_requirement
            print("Resource requirements:", resource_requirements)
            print("Manpower requirement:", manpower_requirements)

            # -------- RESOURCE ALLOCATION --------
            for resource_type, quantity_required in resource_requirements.items():
                available_resources = [
                    resource for resource in get_resources_by_ids_and_type(ids, resource_type)
                    if resource.status == 'active' and resource.quantity > 0
                ]

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
                        resource.quantity, quantity_required - allocated_quantity)
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

                print(f"Allocated {allocated_quantity} units of resource '{resource_type}'.")
                print(resource_allocations)

            # -------- MANPOWER (VOLUNTEER) ALLOCATION --------
            all_volunteers = get_all_volunteers_by_disaster(state.disaster.disaster_id)
            available_volunteers = [
                v for v in all_volunteers
                if v.id in ids and v.status == 'active' and v.id not in assigned_volunteer_ids  # ⬅️ Avoid reassignment
            ]

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
                assigned_volunteer_ids.add(volunteer.id)  # ⬅️ Mark as assigned

            print(f"Allocated {len(volunteer_allocations)} volunteers.")
            print(volunteer_allocations)

            # Store allocations in the task
            task_allocations.append(TaskAllocation(
                task=task,
                resource_allocations=resource_allocations,
                volunteer_allocations=volunteer_allocations
            ))

        state.task_allocations = task_allocations
        
        return state
