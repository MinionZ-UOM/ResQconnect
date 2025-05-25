from app.agent.schemas.types import Action
from app.agent.schemas.state import State
from langgraph.graph import END

class RouteIntake:
    def __call__(self, state: State) -> str:
        if state.next_action.value == Action.disaster_assignment.value:
            return "agent_disaster"
        elif state.next_action.value == Action.task_creation.value:
            return "agent_task"
        else:
            return END