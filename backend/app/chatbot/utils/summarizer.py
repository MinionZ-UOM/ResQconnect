from typing import List, Dict
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage
from langfuse.decorators import langfuse_context, observe


class ChatSummarizer:
    def __init__(self):
        # Initialize the Groq model (LLaMA 3 70B)
        self.model = init_chat_model("groq:gemma2-9b-it")

    def format_chat_history(self, chat_history: List[Dict[str, str]]) -> str:
        """Format chat history into plain text dialogue."""
        return "\n".join(
            f"{entry['role'].capitalize()}: {entry['content']}" for entry in chat_history
        )

    def build_prompt(self, chat_history: List[Dict[str, str]], user_prompt: str) -> str:
        """Build the summarization prompt for the LLM."""
        formatted_history = self.format_chat_history(chat_history)
        return (
            "You are an assistant that summarizes relevant prior conversation context to help respond "
            "to a user's new question. Summarize only the context relevant to the user's latest message.\n\n"
            f"Chat History:\n{formatted_history}\n\n"
            f"New User Message: {user_prompt}\n\n"
            "Relevant Context Summary:"
        )

    @observe(as_type='generation', name='chat_history_summarization')
    def get_contextual_prompt(self, chat_history: List[Dict[str, str]], user_prompt: str) -> str:
        """Generate a relevant context summary from chat history and user prompt."""
        prompt = self.build_prompt(chat_history, user_prompt)

        # Log the input and model parameters before calling the LLM
        langfuse_context.update_current_observation(
            input=prompt,
            model='gemma2-9b-it',
            # model_parameters=model_parameters,
            # metadata=kwargs_clone,
        )

        response = self.model.invoke([HumanMessage(content=prompt)])

        langfuse_context.update_current_observation(
            usage_details={
                "input": len(str(prompt)),
                "output": len(str(response))
            },
            output=str(response)
        )

        return response.content
