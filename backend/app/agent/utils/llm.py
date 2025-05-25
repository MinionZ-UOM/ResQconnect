import os
from typing import Optional, Type, Any
from groq import Groq
import instructor
from langfuse.decorators import langfuse_context, observe

class GroqAgent:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")
        self.client = instructor.patch(Groq(api_key=self.api_key))

    @observe(as_type="generation")
    def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str,
        response_model: Type[Any],
        image_url: str = None,
        max_retries: int = 2
    ) -> Any:
        if image_url:
            messages = [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": user_prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url
                            }
                        }
                    ]
                }
            ]
        else:
           messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ] 

        # Log the input and model parameters before calling the LLM
        langfuse_context.update_current_observation(
            input=messages,
            model=model,
            # model_parameters=model_parameters,
            # metadata=kwargs_clone,
        )

        response = self.client.chat.completions.create(
            model=model,
            response_model=response_model,
            messages=messages,
            max_retries=max_retries,
        )

        langfuse_context.update_current_observation(
            usage_details={
                "input": len(str(messages)),
                "output": len(str(response))
            },
            output=str(response)
        )

        return response
