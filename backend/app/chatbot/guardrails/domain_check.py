from langchain_core.prompts import ChatPromptTemplate
from langchain.chat_models import init_chat_model
from langfuse.decorators import observe


model = init_chat_model("groq:llama3-70b-8192")

domain_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a disaster-domain classifier. Return 'YES' if the prompt is about disasters, volunteers, requests, first responders, affected individuals, or related tasks. Otherwise, return 'NO'."),
    ("human", "User Prompt: {prompt}")
])

domain_chain = domain_prompt | model

@observe(as_type='generation', name='guardrail_is_domain_relevant')
async def is_domain_relevant(prompt: str) -> bool:
    response = await domain_chain.ainvoke({"prompt": prompt})
    return response.content.strip().upper() == "YES"