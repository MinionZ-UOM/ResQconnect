from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.request import Request, RequestCreate, RequestStatusUpdate
from app.schemas.user import User
from app.core.permissions import require_perms
from app.api.deps import get_current_user
from app.crud import request as crud

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
def create_request(
    payload: RequestCreate,
    current: User = Depends(get_current_user),
):
    return crud.create(current.uid, payload)


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
