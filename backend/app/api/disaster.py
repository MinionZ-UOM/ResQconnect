# app/api/disaster.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body, status

from app.schemas.disaster import DisasterCreate, DisasterResponse
from app.api.deps import get_current_user
from app.core.permissions import require_perms as check_permission
from app.crud import disaster as crud
from app.schemas.disaster import JoinedResponse


router = APIRouter(prefix="/disasters", tags=["Disasters"])


@router.post(
    "",
    response_model=DisasterResponse,
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "/",
    include_in_schema=False,
    response_model=DisasterResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_disaster(
    payload: DisasterCreate,
    user=Depends(get_current_user),
):
    if not check_permission(user, "disaster:create"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admins only")
    return crud.create_disaster(payload, admin_uid=user.uid)


@router.get("", response_model=List[DisasterResponse])
@router.get("/", include_in_schema=False, response_model=List[DisasterResponse])
def list_disasters():
    return crud.list_disasters()


@router.get("/{disaster_id}", response_model=DisasterResponse)
def get_disaster(disaster_id: str):
    d = crud.get_disaster(disaster_id)
    if d is None:
        raise HTTPException(404, "Not found")
    return d


@router.post(
    "/{disaster_id}/join",
    response_model=DisasterResponse,
    status_code=status.HTTP_200_OK,
)
def join_disaster(
    disaster_id: str,
    role: str = Body(
        ...,
        embed=True,
        regex="^(volunteer|first_responder|affected_individual)$"
    ),
    user=Depends(get_current_user),
):
    # Attempt to add the user to the disaster
    updated = crud.join_disaster(disaster_id, user.uid, role)
    if updated is None:
        # Crud should return None if the disaster_id was invalid
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Disaster not found")
    return updated


@router.delete(
    "/{disaster_id}/leave",
    response_model=DisasterResponse,
    status_code=status.HTTP_200_OK,
)
def leave_disaster(
    disaster_id: str,
    user=Depends(get_current_user),
):
    """
    Remove the current user from the disaster, and return the updated disaster.
    """
    updated = crud.leave_disaster(disaster_id, user.uid)
    if updated is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Disaster not found")
    return updated


@router.delete("/{disaster_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_disaster_endpoint(
    disaster_id: str,
    user=Depends(get_current_user),
):
    # only callers with the "disaster:delete" permission may delete
    if not check_permission(user, "disaster:delete"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins only"
        )

    crud.delete_disaster(disaster_id)


@router.get(
    "/{disaster_id}/joined",
    response_model=JoinedResponse,
    summary="Check if current user has joined a disaster"
)
def check_joined(
    disaster_id: str,
    user=Depends(get_current_user),
):
    joined = crud.has_joined(disaster_id, user.uid)
    if joined is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disaster not found"
        )
    return JoinedResponse(joined=joined)