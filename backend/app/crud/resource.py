from datetime import datetime, timezone
from typing import List, Optional
from google.cloud.firestore import DocumentReference
from app.core.firebase import get_db
from app.schemas.resource import ResourceCreate, ResourceUpdate, Resource

COLLECTION = "resources"
USER_COLLECTION = "users"

def _ref(rid: str | None = None) -> DocumentReference:
    coll = get_db().collection(COLLECTION)
    return coll.document(rid) if rid else coll.document()

def create(obj_in: ResourceCreate) -> Resource:
    doc = _ref()

    # Get user document by uid
    user_snap = get_db().collection(USER_COLLECTION).document(obj_in.uid).get()
    if not user_snap.exists:
        raise ValueError("User not found")

    user_data = user_snap.to_dict()
    role_id = str(user_data.get("role_id"))
    if role_id not in ["admin", "volunteer"]:
        raise ValueError("Invalid role_id in user profile")

    data = obj_in.dict()
    data["role_id"] = role_id
    data["updated_at"] = datetime.now(timezone.utc)

    doc.set(data)
    return Resource(resource_id=doc.id, **data)

def get(rid: str) -> Optional[Resource]:
    snap = _ref(rid).get()
    if not snap.exists:
        return None

    data = snap.to_dict()

    if "role_id" not in data or not data["role_id"]:
        uid = data.get("uid")
        if not uid:
            raise ValueError(f"Cannot resolve 'role_id': UID is missing in resource {rid}")

        user_snap = get_db().collection(USER_COLLECTION).document(uid).get()
        if not user_snap.exists:
            raise ValueError(f"User not found for UID: {uid}")

        role_id = user_snap.to_dict().get("role_id")
        if not role_id:
            raise ValueError(f"role_id missing in user profile for UID: {uid}")

        _ref(rid).update({"role_id": role_id})
        data["role_id"] = role_id

    return Resource(resource_id=snap.id, **data)


def list_all() -> List[Resource]:
    resources = []
    for s in get_db().collection(COLLECTION).stream():
        try:
            resources.append(Resource(resource_id=s.id, **s.to_dict()))
        except Exception as e:
            print(f"[WARN] Skipping invalid resource {s.id}: {e}")
    return resources

def list_available() -> List[Resource]:
    query = get_db().collection(COLLECTION).where("status", "==", "available")
    resources = []
    for s in query.stream():
        try:
            resources.append(Resource(resource_id=s.id, **s.to_dict()))
        except Exception as e:
            print(f"[WARN] Skipping invalid available resource {s.id}: {e}")
    return resources

def patch(rid: str, obj_in: ResourceUpdate) -> Resource:
    existing = get(rid)
    if not existing:
        raise ValueError("Resource not found")

    data = {}

    if obj_in.quantity_used is not None:
        new_available = existing.quantity_available - obj_in.quantity_used
        if new_available < 0:
            raise ValueError("Not enough quantity available to fulfill this request")
        data["quantity_available"] = new_available

        # Auto-update status based on availability only
        data["status"] = "not_available" if new_available == 0 else "available"

    else:
        raise ValueError("quantity_used is required to update the resource")

    data["updated_at"] = datetime.now(timezone.utc)
    _ref(rid).update(data)

    return get(rid)

def set_status(rid: str, status: str) -> Resource:
    _ref(rid).update({
        "status": status,
        "updated_at": datetime.now(timezone.utc)
    })
    return get(rid)

def update_role_id_by_uid(uid: str):
    user_snap = get_db().collection(USER_COLLECTION).document(uid).get()
    if not user_snap.exists:
        raise ValueError("User not found")

    user_data = user_snap.to_dict()
    role_id = str(user_data.get("role_id"))
    if role_id not in ["admin", "volunteer"]:
        raise ValueError("Invalid role_id in user profile")

    query = get_db().collection(COLLECTION).where("uid", "==", uid).where("role_id", "==", None)
    for doc in query.stream():
        doc.reference.update({
            "role_id": role_id,
            "updated_at": datetime.now(timezone.utc)
        })

def delete(rid: str) -> bool:
    doc_ref = _ref(rid)
    snap = doc_ref.get()
    if not snap.exists:
        raise ValueError("Resource not found")
    doc_ref.delete()
    return True

def set_status(rid: str, status: str) -> Resource:
    _ref(rid).update({
        "status": status,
        "updated_at": datetime.now(timezone.utc)
    })
    return get(rid)  
