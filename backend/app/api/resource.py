from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.resource import ResourceCreate, Resource, ResourceUpdate
from app.core.permissions import require_perms
from app.crud import resource as crud

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.post(
    "/", response_model=Resource, status_code=status.HTTP_201_CREATED,
    dependencies=[require_perms("resource:create")]
)
def create_resource(payload: ResourceCreate):
    return crud.create(payload)


@router.get(
    "/", response_model=list[Resource], dependencies=[require_perms("resource:read")]
)
def list_resources():
    return crud.list_all()


@router.get("/{rid}", response_model=Resource, dependencies=[require_perms("resource:read")])
def read_resource(rid: str):
    res = crud.get(rid)
    if not res:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Resource not found")
    return res


@router.patch(
    "/{rid}", response_model=Resource, dependencies=[require_perms("resource:update")]
)
def update_resource(rid: str, payload: ResourceUpdate):
    res = crud.get(rid)
    if not res:
        raise HTTPException(404, "Resource not found")
    return crud.patch(rid, payload)
