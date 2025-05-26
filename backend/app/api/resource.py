from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.resource import ResourceCreate, Resource, ResourceUpdate, StatusChangePayload
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
    

@router.delete(
    "/{rid}",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    dependencies=[require_perms("resource:delete")]
)
def delete_resource(rid: str):
    try:
        crud.delete(rid)
        return {"detail": "Resource deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")

@router.put(
    "/{rid}/status",
    response_model=Resource,
    status_code=status.HTTP_200_OK,
    dependencies=[require_perms("resource:update")]
)
def change_resource_status(rid: str, payload: StatusChangePayload):
    try:
        return crud.set_status(rid, payload.status.value)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {str(e)}")