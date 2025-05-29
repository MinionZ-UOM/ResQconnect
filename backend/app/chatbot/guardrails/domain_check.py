from langchain_core.prompts import ChatPromptTemplate
from langchain.chat_models import init_chat_model
from langfuse.decorators import observe, langfuse_context


model = init_chat_model("groq:llama3-70b-8192")

domain_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a disaster-domain classifier. Return 'YES' if the prompt is about disasters, volunteers, requests, first responders, affected individuals, or related tasks. Otherwise, return 'NO'."),
    ("human", "User Prompt: {prompt}")
])

domain_chain = domain_prompt | model

@observe(as_type='generation', name='guardrail_is_domain_relevant')
async def is_domain_relevant(prompt: str) -> bool:
    # Log the input and model parameters before calling the LLM
    langfuse_context.update_current_observation(
        input=prompt,
        model='llama3-70b-8192',
    )

    response = await domain_chain.ainvoke({"prompt": prompt})

    langfuse_context.update_current_observation(
        usage_details={
            "input": len(str(prompt)),
            "output": len(str(response))
        },
        output=str(response)
    )
    return response.content.strip().upper() == "YES"