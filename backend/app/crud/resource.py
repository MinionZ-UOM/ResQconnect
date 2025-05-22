from datetime import datetime, timezone
from typing import List, Optional

from google.cloud.firestore import DocumentReference
from app.core.firebase import get_db
from app.schemas.resource import ResourceCreate, ResourceUpdate, Resource

COLLECTION = "resources"


def _ref(rid: str | None = None) -> DocumentReference:
    coll = get_db().collection(COLLECTION)
    return coll.document(rid) if rid else coll.document()


def create(obj_in: ResourceCreate) -> Resource:
    doc = _ref()
    data = obj_in.dict()
    data["updated_at"] = datetime.now(timezone.utc)
    doc.set(data)
    return Resource(id=doc.id, **data)


def get(rid: str) -> Optional[Resource]:
    snap = _ref(rid).get()
    return Resource(id=snap.id, **snap.to_dict()) if snap.exists else None


def list_all() -> List[Resource]:
    return [Resource(id=s.id, **s.to_dict()) for s in get_db().collection(COLLECTION).stream()]


def patch(rid: str, obj_in: ResourceUpdate) -> Resource:
    data = {k: v for k, v in obj_in.dict().items() if v is not None}
    data["updated_at"] = datetime.now(timezone.utc)
    _ref(rid).update(data)
    return get(rid)
