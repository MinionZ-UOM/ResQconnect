from fastapi import APIRouter, Depends

from app.chatbot.schemas.chat_input import ChatInput, ScoreInput
from app.chatbot.core.chatbot import Chatbot

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

@router.post("/ask")
async def ask(
    body: ChatInput
):  
    
    client = Chatbot()
    await client.setup()
    response = await client.ask(prompt=body.prompt, user=body.user)
    
    return response

@router.post("/score")
async def score(
    body: ScoreInput
):  
    
    client = Chatbot()

    response = client.score(trace_id=body.trace_id, value=body.value)
    
    return response