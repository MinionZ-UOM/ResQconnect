# app/api/disaster.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body, status

from app.schemas.disaster import DisasterCreate, DisasterResponse
from app.api.deps import get_current_user
from app.core.permissions import require_perms as check_permission
from app.crud import disaster as crud

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


@router.post("/{disaster_id}/join", status_code=204)
def join_disaster(
    disaster_id: str,
    role: str = Body(..., embed=True, regex="^(volunteer|first_responder|affected_individual)$"),
    user=Depends(get_current_user),
):
    crud.join_disaster(disaster_id, user.uid, role)


@router.delete("/{disaster_id}/leave", status_code=204)
def leave_disaster(disaster_id: str, user=Depends(get_current_user)):
    crud.leave_disaster(disaster_id, user.uid)


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