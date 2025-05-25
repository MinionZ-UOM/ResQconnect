from fastapi import APIRouter, Depends
from app.agent.schemas.state import State
from app.agent.core.manager import Manager

from app.agent.rag.rag import build_vectorstores_from_pdfs, retrieve_from_collection, parse_documents_to_text

router = APIRouter(prefix="/agent", tags=["agent"])

@router.post("/ask", response_model=State)
async def ask(
    body: State
):  
    
    manager = Manager()

    response = manager.run(body)
    
    return response   

# @router.post("/visualize", response_model=str)
# async def ask():  
    
#     manager = Manager()

#     path = manager.visualize()
    
#     return path   