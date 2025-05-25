from app.agent.core.base_agent import BaseAgent
from app.agent.schemas.state import State

class AgentOrchestrator(BaseAgent):
    def handle(self, state: State) -> State:
        print('Inside orchestrator agent')

        if not state.next_action:
            # implement steps to determine next action
            print('defining action')
            # determine and set next action here
        else:
            print(f'action: {state.next_action.value}')

        return state
