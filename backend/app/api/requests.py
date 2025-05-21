from fastapi import APIRouter, Depends
from app.core.permissions import require_perms, get_current_user
from app.schemas.user import User

router = APIRouter(prefix="/requests", tags=["requests"])

# Affected individual creates a request
@router.post("/", dependencies=[require_perms("request:create")])
async def create_request(payload: dict, user: User = Depends(get_current_user)):
    # implement save to Firestore...
    return {"msg": "Request submitted", "by": user.uid}

# First responders & admins list all requests
@router.get("/", dependencies=[require_perms("request:read_all")])
async def list_all_requests():
    return ["req-1", "req-2"]
