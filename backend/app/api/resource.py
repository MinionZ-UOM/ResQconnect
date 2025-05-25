from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.resource import ResourceCreate, Resource, ResourceUpdate
from app.core.permissions import require_perms
from app.crud import resource as crud

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.post(
    "/", 
    response_model=Resource, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[require_perms("resource:create")]
)
def create_resource(payload: ResourceCreate):
    try:
        return crud.create(payload)  # role_id is fetched based on uid
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.get(
    "/", 
    response_model=list[Resource], 
    dependencies=[require_perms("resource:read")]
)
def list_resources():
    try:
        return crud.list_all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch resources: {str(e)}")


@router.get(
    "/available", 
    response_model=list[Resource], 
    dependencies=[require_perms("resource:read")]
)
def list_available_resources():
    try:
        return crud.list_available()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch available resources: {str(e)}")


@router.get(
    "/{rid}", 
    response_model=Resource, 
    dependencies=[require_perms("resource:read")]
)
def read_resource(rid: str):
    res = crud.get(rid)
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    return res


@router.patch(
    "/{rid}", 
    response_model=Resource, 
    dependencies=[require_perms("resource:update")]
)
def update_resource(rid: str, payload: ResourceUpdate):
    res = crud.get(rid)
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")
    try:
        return crud.patch(rid, payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")
