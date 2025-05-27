from typing import Optional
from app.agent.core.base_agent import BaseAgent
from app.agent.schemas.state import State
from app.agent.schemas.disaster import Disaster
from app.agent.schemas.types import Action
from app.agent.utils.disaster import add_disaster, get_disaster_by_id, get_nearest_disasters, load_disasters

from app.agent.config.llms_config_loader import LLMConfig
from app.agent.utils.llm import GroqAgent


class AgentDisaster(BaseAgent):
    def handle(self, state: State) -> State:
        print('Inside disaster agent')

        # Instantiate the agent and config
        groq_agent = GroqAgent()
        llm_cfg = LLMConfig()

        nearest = get_nearest_disasters(request=state.request, top_n=2)
        print([disaster.dict() for disaster in nearest])

        system_prompt = """
        You are an disaster assigning agent, you will be given with a set of disasters and a request.
        The disasters are fetched using the coordinates which are closer to the request location.
        Analyse the disasters and try to figure out if the request could be assigned to any of the listed disasters.
        if yes return the disaster id.
        if the disaster is same city is different return None
        if the city is same but the disaster is different return None
        """

        user_prompt = f"""
        List of nearest disasters:
        {[disaster.dict() for disaster in nearest]}

        New request:
        {state.request.dict()}
        """

        # Make the request
        disaster_id = groq_agent.complete(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=llm_cfg.get_model('groq', 'DISASTER_ASSIGNMENT'),
            response_model=Optional[str],
            trace_name='disaster_assignment'
        )

        print(f"Disaster ID returned: {disaster_id}")

        if not (disaster_id == None or disaster_id == 'None'): 
            state.request.disaster_id = disaster_id
            state.disaster = get_disaster_by_id(disaster_id)
        else:
            disasters = load_disasters()
            # firestore needs to handle this creation
            new_disaster_id = "Savinu"

            system_prompt = """
            You are an disaster creating agent. You will be provided with new disaster id and a request.
            You have to create an disaster from the request, for the location of the disaster try to use the city of the request.
            """
            user_prompt = f"""
            new disaster id : {new_disaster_id}
            request: {state.request}
            """

            # Make the request
            disaster_parsed = groq_agent.complete(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=llm_cfg.get_model('groq', 'DISASTER_CREATION'),
                response_model=Disaster,
                trace_name='disaster_creation'
            )

            for key, value in disaster_parsed.dict().items():
                print(f"{key}: {value}")

            state.request.disaster_id = new_disaster_id
            state.disaster = disaster_parsed
            add_disaster(disaster_parsed)

        state.previous_action = Action.disaster_assignment
        state.next_action = Action.task_creation
        
        return state