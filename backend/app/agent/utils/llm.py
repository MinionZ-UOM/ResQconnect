import os
from typing import Optional, Type, Any
from groq import Groq
import instructor

class GroqAgent:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")
        self.client = instructor.patch(Groq(api_key=self.api_key))

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
           
        return self.client.chat.completions.create(
            model=model,
            response_model=response_model,
            messages=messages,
            max_retries=max_retries,
        )
