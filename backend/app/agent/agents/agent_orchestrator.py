from app.agent.core.base_agent import BaseAgent
from app.agent.schemas.state import State

from app.utils.logger import get_logger
logger = get_logger(__name__)

class AgentOrchestrator(BaseAgent):
    def handle(self, state: State) -> State:
        logger.info('Inside orchestrator agent')

        if not state.next_action:
            # implement steps to determine next action
            logger.info('defining action')
            # determine and set next action here
        else:
            logger.info(f'action: {state.next_action.value}')

        return state
