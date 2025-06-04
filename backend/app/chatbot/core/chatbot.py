from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate

from typing import List
import yaml
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.graph import StateGraph, MessagesState, START
from langgraph.prebuilt import ToolNode, tools_condition
from langchain.chat_models import init_chat_model

from langfuse.callback import CallbackHandler
from langfuse.decorators import langfuse_context, observe
import os

from app.chatbot.schemas.user import User

from app.chatbot.guardrails.domain_check import is_domain_relevant
from app.chatbot.guardrails.ethics_check import is_prompt_safe
from app.chatbot.utils.summarizer import ChatSummarizer

from langfuse import Langfuse

from app.utils.logger import get_logger
logger = get_logger(__name__)

class Chatbot:
    def __init__(self, config_path: str = "app/chatbot/config/mcp_config.yaml"):
        self.model = init_chat_model("groq:llama3-70b-8192")
        self.config_path = config_path
        self.client = None
        self.tools = None
        self.graph = None
        self.langfuse = Langfuse()
        self.chat_summarizer = ChatSummarizer()

    def load_config(self):
        with open(self.config_path, "r") as f:
            return yaml.safe_load(f)

    async def setup(self):
        config = self.load_config()
        self.client = MultiServerMCPClient(config['servers'])
        self.tools = await self.client.get_tools()

        def call_model(state: MessagesState):
            response = self.model.bind_tools(
                self.tools).invoke(state["messages"])
            return {"messages": response}

        builder = StateGraph(MessagesState)
        builder.add_node("call_model", call_model)
        builder.add_node("tools", ToolNode(self.tools))
        builder.add_edge(START, "call_model")
        builder.add_conditional_edges("call_model", tools_condition)
        builder.add_edge("tools", "call_model")
        self.graph = builder.compile()

    async def ask(self, prompt: str, user: User, chat_history=list):
        logger.info("Inside Chatbot")
        logger.debug(f"prompt: {prompt}")
        logger.debug(f"user: {str(user)}")
        logger.debug(f"chat_history: {str(chat_history)}")

        if self.graph is None:
            raise RuntimeError("Graph not initialized. Call setup() first.")
        
        if len(chat_history) > 0:
            context = self.chat_summarizer.get_contextual_prompt(chat_history, prompt)

            prompt_with_context = f"""
            user_prompt is : {prompt}
            context_from_chat_history : {context}
            """
        else:
            prompt_with_context = prompt

        # Run guardrails
        if not await is_prompt_safe(prompt_with_context):
            logger.debug('unethical prompt')
            return {"message": "Your input was flagged as inappropriate or unethical. Please reformulate your query respectfully."}

        if not await is_domain_relevant(prompt_with_context):
            logger.debug('domain irrelevant prompt')
            return {"message": "This chatbot is specialized for disaster management topics. Please ask something related to disasters, volunteers, or aid coordination."}

        
        message = f"""
        The user info is : {user.dict()}
        {prompt_with_context}
        """

        trace = self.langfuse.trace()
        langfuse_handler_trace = trace.get_langchain_handler(
            update_parent=True  # add i/o to trace itself as well
        )

        response = await self.graph.ainvoke({"messages": message}, config={"callbacks": [langfuse_handler_trace], "run_name": 'langgraph_resq_chatbot'})

        logger.debug(f"response: {response['messages'][-1].content}")

        return {
            'trace': trace.id,
            'response': response['messages'][-1].content
        }

    def score(self, trace_id: str, value: int):

        comments = ['This was a bad answer', 'This was a good answer']
        score_name = "user-feedback-resq-chatbot"

        self.langfuse.score(
            trace_id=trace_id,
            name=score_name,
            value=value,
            comment=comments[value]
        )

        return {'status': 'score added', 'trace_id': trace_id, 'name': score_name, 'value': value, 'comment': comments[value]}
