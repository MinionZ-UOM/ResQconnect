from typing import List, Optional
from app.agent.core.base_agent import BaseAgent
from app.agent.schemas.state import State
from app.agent.rag.rag import build_vectorstores_from_pdfs, retrieve_from_collection, parse_documents_to_text
from app.agent.schemas.types import Action
from app.agent.utils.observation import load_observations_by_disaster_id
from app.agent.utils.task import save_tasks
from app.agent.schemas.task import Task
from app.agent.config.llms_config_loader import LLMConfig
from app.agent.utils.llm import GroqAgent
from app.agent.utils.task_resources import save_request_resources


class AgentTask(BaseAgent):
    def handle(self, state: State) -> State:
        print('Inside task agent')

        guidelines = ""
        try:
            build_vectorstores_from_pdfs()
            docs = retrieve_from_collection(
                collection_name=state.request.disaster_type.lower(),
                query=state.request.original_request_text,
            )
            guidelines = parse_documents_to_text(docs)
        except Exception as e:
            print(f'Error doing rag: {e}')

        top_k = 3
        observations = load_observations_by_disaster_id(state.request.disaster_id, top_k=top_k)
        
        # Safety check for state.request and state.disaster before accessing .dict()
        if not state.request:
            print("Error: 'state.request' is None. Cannot proceed with task creation.")
            return state
        
        if not state.disaster:
            print("Error: 'state.disaster' is None. Cannot proceed with task creation.")
            return state

        # Proceed with task creation only if state.request and state.disaster are valid
        try:
            # Instantiate the agent and config
            groq_agent = GroqAgent()
            llm_cfg = LLMConfig()

            system_prompt = f"""
            You are a task creation agent. 
            You will be provided with :
                -request submitted by the affected individual of an disaster
                -information about the disaster
                -latest {top_k} observations submitted by the volunteers at the spot
                -disaster management guidelines retrieved from the vectorstore 
            Create tasks to be done in order to complete the request of the affected individual
            only use the information about the disaster and latest observations to get more current context.
            do not create any task that is not related with the request submitted by the affected individual

            - create tasks as actionable steps to volunteers
            - create maximum of 3 tasks
            - each task should be a standalone task, should not be a continuation of other one
            - only provide tasks for the request, do not provide tasks for the observations.
            """
            user_prompt = f"""
            Only create tasks relevant to do the needful to the request of the affected individual
            request submitted by the affected  individual:
            {state.request.dict()}

            Use the below info only to just get the current situation of the disaster
            information about the disaster:
            {state.disaster.dict()}

            latest {top_k} observations from the volunteers at the site:
            {[observation.dict() for observation in observations]}

            use the below guidelines too:
            {guidelines}
            """

            # Make the request
            tasks = groq_agent.complete(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=llm_cfg.get_model('groq', 'TASK_CREATION'),
                response_model=Optional[List[Task]],
                trace_name='task_creation'
            )

            # persist into Firestore via CRUD layer**
            saved = save_tasks(tasks, state.request)
            # Extract and save resource & manpower info
            entries = []
            for created, at in zip(saved, tasks):
                entries.append({
                    "task_id": created.id,
                    "resource_requirements": [
                        {"resource_type": rt, "quantity": qty}
                        for rt, qty in getattr(at, "resource_requirements", [])
                    ],
                    "manpower_requirement": getattr(at, "manpower_requirement", None),
                })

            req_id = getattr(state.request, "source_request_id", None) or state.request.disaster_id
            save_request_resources(req_id, entries)

            state.tasks = tasks
            
            state.previous_action = Action.task_creation
            state.next_action = None

            print("Tasks saved to DB:", saved)

            print("Tasks created successfully:", state.tasks)
            print("State request task creation:", state.request)
        except Exception as e:
            print(f"Error during task creation: {e}")
            # Optionally, you could return the state with an error message or empty tasks
            state.tasks = []

        return state
