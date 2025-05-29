from langchain_core.prompts import ChatPromptTemplate
from langchain.chat_models import init_chat_model
from langfuse.decorators import observe, langfuse_context


model = init_chat_model("groq:llama3-70b-8192")

ethics_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a content safety checker. Return 'NO' if the prompt contains hate speech, abusive language, violence, threats, or unethical content. Otherwise, return 'YES'."),
    ("human", "User Prompt: {prompt}")
])

ethics_chain = ethics_prompt | model


@observe(as_type='generation', name='guardrail_is_prompt_safe')
async def is_prompt_safe(prompt: str) -> bool:
    # Log the input and model parameters before calling the LLM
    langfuse_context.update_current_observation(
        input=prompt,
        model='llama3-70b-8192',
    )

    response = await ethics_chain.ainvoke({"prompt": prompt})

    langfuse_context.update_current_observation(
        usage_details={
            "input": len(str(prompt)),
            "output": len(str(response))
        },
        output=str(response)
    )
    
    return response.content.strip().upper() == "YES"