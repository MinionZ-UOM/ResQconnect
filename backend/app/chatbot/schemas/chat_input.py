from pydantic import BaseModel
from app.chatbot.schemas.user import Coordinates, User

class ChatInput(BaseModel):
    user: User
    prompt: str
    chat_history: list

class ScoreInput(BaseModel):
    trace_id: str
    value: int