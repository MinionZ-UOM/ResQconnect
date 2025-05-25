from app.agent.schemas.state import State
from app.agent.schemas.types import Action
from langgraph.graph import END

class RouteOrchestrator:
    def __call__(self, state: State) -> str:
        if state.next_action.value == Action.request_extraction.value:
            return "agent_intake"
        elif state.next_action.value == Action.disaster_assignment.value:
            return "agent_disaster"
        elif state.next_action.value == Action.task_creation.value:
            return "agent_task"
        elif state.next_action.value == Action.task_allocation.value:
            return "agent_allocation"
        else:
            return END