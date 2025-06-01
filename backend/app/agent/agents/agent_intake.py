from app.agent.core.base_agent import BaseAgent
from app.agent.schemas.state import State
from app.agent.schemas.types import Action
from app.agent.utils.disaster import get_disaster_by_id
from app.agent.utils.location import get_location
from app.agent.utils.request import analyse_image, parse_text, stt

from app.utils.logger import get_logger
logger = get_logger(__name__)

class AgentIntake(BaseAgent):
    def handle(self, state: State) -> State:
        logger.info('Inside intake agent')

        if state.request.coordinates:
            state.request.location_from_coordinates = get_location(state.request.coordinates)
            logger.debug(f'location_from_coordinates: {state.request.location_from_coordinates}')

        user_prompt = ""
        if state.request.original_request_text_available:
            user_prompt += f"\nUser's text input:\n{state.request.original_request_text}"
        if state.request.original_request_voice_available:
            state.request.extracted_request_voice = stt(state.request.original_request_voice)
            user_prompt += f"\nUser's voice input:\n{state.request.extracted_request_voice}"
        if state.request.original_request_image_available:
            state.request.extracted_request_image = analyse_image(state.request.original_request_image)
            user_prompt += f"\nUser's image input:\n{state.request.extracted_request_image}"

        logger.debug(user_prompt)

        parsed_request = parse_text(user_prompt)

        if parsed_request:
            state.request.location_from_input = parsed_request.location_from_input
            state.request.urgency = parsed_request.urgency
            state.request.type_of_need = parsed_request.type_of_need
            state.request.disaster_type = parsed_request.disaster_type
            state.request.affected_people_count = parsed_request.affected_people_count

        if state.previous_action is None:
            if state.request.disaster_id is None:
                state.previous_action = Action.request_extraction
                state.next_action = Action.disaster_assignment
            else:
                state.disaster = get_disaster_by_id(state.request.disaster_id)
                state.previous_action = Action.request_extraction
                state.next_action = Action.task_creation

        return state