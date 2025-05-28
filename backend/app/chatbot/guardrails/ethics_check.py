from langchain_core.prompts import ChatPromptTemplate
from langchain.chat_models import init_chat_model
from langfuse.decorators import observe


model = init_chat_model("groq:llama3-70b-8192")

ethics_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a content safety checker. Return 'NO' if the prompt contains hate speech, abusive language, violence, threats, or unethical content. Otherwise, return 'YES'."),
    ("human", "User Prompt: {prompt}")
])

ethics_chain = ethics_prompt | model


@observe(as_type='generation', name='guardrail_is_prompt_safe')
async def is_prompt_safe(prompt: str) -> bool:
    response = await ethics_chain.ainvoke({"prompt": prompt})
    return response.content.strip().upper() == "YES"