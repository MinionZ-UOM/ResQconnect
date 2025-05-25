from typing import Optional
from app.agent.core.base_agent import BaseAgent
from app.agent.schemas.state import State
from app.agent.schemas.incident import Incident
from app.agent.schemas.types import Action
from app.agent.utils.incident import add_incident, get_incident_by_id, get_nearest_incidents, load_incidents

from app.agent.config.llms_config_loader import LLMConfig
from app.agent.utils.llm import GroqAgent


class AgentIncident(BaseAgent):
    def handle(self, state: State) -> State:
        print('Inside incident agent')

        # Instantiate the agent and config
        groq_agent = GroqAgent()
        llm_cfg = LLMConfig()

        nearest = get_nearest_incidents(request=state.request, top_n=2)
        print([incident.dict() for incident in nearest])

        system_prompt = """
        You are an incident assigning agent, you will be given with a set of incidents and a request.
        The incidents are fetched using the coordinates which are closer to the request location.
        Analyse the incidents and try to figure out if the request could be assigned to any of the listed incidents.
        if yes return the incident id.
        if the disaster is same city is different return None
        if the city is same but the disaster is different return None
        """

        user_prompt = f"""
        List of nearest incidents:
        {[incident.dict() for incident in nearest]}

        New request:
        {state.request.dict()}
        """

        # Make the request
        incident_id = groq_agent.complete(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=llm_cfg.get_model('groq', 'INCIDENT_ASSIGNMENT'),
            response_model=Optional[int]
        )

        if incident_id:
            state.request.incident_id = incident_id
            state.incident = get_incident_by_id(incident_id)
        else:
            incidents = load_incidents()
            new_incident_id = incidents[-1].incident_id + 1

            system_prompt = """
            You are an incident creating agent. You will be provided with new incident id and a request.
            You have to create an incident from the request, for the location of the incident try to use the city of the request.
            """
            user_prompt = f"""
            new incident id : {new_incident_id}
            request: {state.request}
            """

            # Make the request
            incident_parsed = groq_agent.complete(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=llm_cfg.get_model('groq', 'INCIDENT_CREATION'),
                response_model=Incident
            )

            for key, value in incident_parsed.dict().items():
                print(f"{key}: {value}")

            state.request.incident_id = new_incident_id
            state.incident = incident_parsed
            add_incident(incident_parsed)

        state.previous_action = Action.incident_assignment
        state.next_action = Action.task_creation
        
        return state