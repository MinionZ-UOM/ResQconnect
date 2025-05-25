from fastapi import APIRouter, Depends, HTTPException, status ,BackgroundTasks
from typing import List
from app.schemas.request import Request, RequestCreate, RequestStatusUpdate
from app.schemas.user import User
from app.core.permissions import require_perms
from app.api.deps import get_current_user
from app.crud import request as crud

from app.celery_config import run_agentic_workflow

router = APIRouter(prefix="/requests", tags=["Requests"], redirect_slashes=False)

# - create -
@router.post(
    "",
    response_model=Request,
    status_code=status.HTTP_201_CREATED,
    dependencies=[require_perms("request:create")],
)
@router.post(
    "/",  
    include_in_schema=False,
    response_model=Request,
    status_code=status.HTTP_201_CREATED,
    dependencies=[require_perms("request:create")],
)
async def create_request(
    payload: RequestCreate,
    background_tasks: BackgroundTasks,
    current: User = Depends(get_current_user)
):
    # Step 1: Create the request in the database
    request = crud.create(current.uid, payload)

    # Step 2: Prepare the payload for the agentic workflow
    agent_payload = {
        "previous_action": None,
        "next_action": "request_extraction",
        "request": {
            "incident_id": request.id,
            "original_request_text_available": True,
            "original_request_text": payload.description,
            "original_request_voice_available": False,
            "original_request_voice": "",
            "extracted_request_voice": None,
            "original_request_image_available": True,
            "original_request_image": request.media[0].url if request.media else None,
            "extracted_request_image": None,
            "coordinates": {
                "latitude": request.location.lat,
                "longitude": request.location.lng
            },
            "location_from_coordinates": None,
            "location_from_input": None,
            "urgency": None,
            "type_of_need": request.type_of_need.lower(),
            "disaster_type": None,
            "affected_people_count": None
        },
        "incident": None,
        "tasks": None
    }

    # Step 3: Trigger the Celery task to run the agentic workflow asynchronously
    run_agentic_workflow.apply_async(args=[agent_payload])

    return request


# - list -
@router.get(
    "",
    response_model=List[Request],
    dependencies=[require_perms("request:read_all")],
)
@router.get(
    "/",  
    include_in_schema=False,
    response_model=List[Request],
    dependencies=[require_perms("request:read_all")],
)
def list_requests():
    return crud.list_all()


@router.get(
    "/me",
    response_model=list[Request],
    dependencies=[require_perms("request:read_own")],
)
def my_requests(current: User = Depends(get_current_user)):
    return crud.list_by_owner(current.uid)


# - detail -
@router.get("/{req_id}", response_model=Request)
def read_request(
    req_id: str,
    current: User = Depends(get_current_user),
):
    req = crud.get(req_id)
    if not req:
        raise HTTPException(404, "Request not found")

    # authorisation: admins / responders can read_all, owner can read_own
    try:
        require_perms("request:read_all")(current)
    except HTTPException:
        if req.created_by != current.uid:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Not authorised")

    return req


# - status patch -
@router.patch(
    "/{req_id}/status",
    response_model=Request,
    dependencies=[require_perms("request:update_status")],  # add to roles!
)
def update_request_status(
    req_id: str,
    payload: RequestStatusUpdate,
):
    if not crud.get(req_id):
        raise HTTPException(404, "Request not found")
    return crud.patch_status(req_id, payload)
