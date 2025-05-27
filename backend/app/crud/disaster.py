# app/crud/disaster.py
from typing import List, Optional
from firebase_admin import firestore
from datetime import datetime, timezone

from app.core.firebase import get_db
from app.schemas.disaster import DisasterCreate, DisasterResponse

db = get_db()


def create_disaster(
    payload: DisasterCreate,
    admin_uid: str = "",
    is_agent_suggestion: bool = False,
) -> DisasterResponse:
    batch = db.batch()
    disaster_ref = db.collection("disasters").document()
    chat_ref = db.collection("chatSessions").document()
    now = firestore.SERVER_TIMESTAMP

    batch.set(
        disaster_ref,
        {
            **payload.dict(),
            "created_at": now,
            "created_by": admin_uid,
            "chat_session_id": chat_ref.id,
            "participants": [],
            "is_agent_suggestion": is_agent_suggestion,
        },
    )
    batch.set(
        chat_ref,
        {
            "disaster_id": disaster_ref.id,
            "created_at": now,
        },
    )
    batch.commit()

    return DisasterResponse(
        id=disaster_ref.id,
        chat_session_id=chat_ref.id,
        created_at=datetime.now(timezone.utc),
        created_by=admin_uid,
        **payload.dict(),
    )


def list_disasters() -> List[DisasterResponse]:
    docs = db.collection("disasters").stream()
    return [DisasterResponse(id=d.id, **d.to_dict()) for d in docs]


def get_disaster(disaster_id: str) -> Optional[DisasterResponse]:
    doc_ref = db.collection("disasters").document(disaster_id)
    snap = doc_ref.get()
    if not snap.exists:
        return None

    data = snap.to_dict() or {}
    # load participants sub-collection
    parts = doc_ref.collection("participants").stream()
    participants = [{"uid": p.id, **(p.to_dict() or {})} for p in parts]
    data["participants"] = participants
    return DisasterResponse(id=snap.id, **data)


def join_disaster(disaster_id: str, uid: str, role: str) -> Optional[DisasterResponse]:
    doc_ref = db.collection("disasters").document(disaster_id)
    snap = doc_ref.get()
    if not snap.exists:
        return None

    # 1) add/update the participant sub-doc
    doc_ref.collection("participants") \
           .document(uid) \
           .set(
               {"role": role, "joined_at": firestore.SERVER_TIMESTAMP},
               merge=True
           )

    # 2) also array-union the UID into the root `participants` field
    doc_ref.update({
        "participants": firestore.ArrayUnion([uid])
    })

    # return the updated disaster, including full participants list
    return get_disaster(disaster_id)


def leave_disaster(disaster_id: str, uid: str) -> Optional[DisasterResponse]:
    doc_ref = db.collection("disasters").document(disaster_id)
    if not doc_ref.get().exists:
        return None

    # remove from sub-collection
    doc_ref.collection("participants").document(uid).delete()

    # remove from root array
    doc_ref.update({
        "participants": firestore.ArrayRemove([uid])
    })

    return get_disaster(disaster_id)


def delete_disaster(disaster_id: str) -> None:
    """
    Permanently remove the disaster document and its associated chat session.
    """
    doc_ref = db.collection("disasters").document(disaster_id)
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict() or {}
        chat_id = data.get("chat_session_id")
        if chat_id:
            db.collection("chatSessions").document(chat_id).delete()
    doc_ref.delete()


def has_joined(disaster_id: str, uid: str) -> Optional[bool]:
    """
    Return:
      - True  if the user UID is in the participants sub-collection
      - False if the disaster exists but the user hasn’t joined
      - None  if the disaster does not exist at all
    """
    doc_ref = db.collection("disasters").document(disaster_id)
    snap = doc_ref.get()
    if not snap.exists:
        return None

    part_doc = doc_ref.collection("participants").document(uid).get()
    return part_doc.exists

# --- Functions for Volunteers Retrieval ---

def get_all_volunteers_by_disaster(disaster_id: str) -> Optional[List[dict]]:
    """
    Return full participant records for volunteers (role='volunteer') in a disaster.
    - Returns None if the disaster does not exist.
    """
    doc_ref = db.collection("disasters").document(disaster_id)
    snap = doc_ref.get()
    if not snap.exists:
        return None

    # Query volunteer participants from sub-collection
    volunteer_docs = doc_ref.collection("participants") \
                          .where("role", "==", "volunteer") \
                          .stream()
    volunteers = [{"uid": v.id, **(v.to_dict() or {})} for v in volunteer_docs]
    return volunteers


def get_all_volunteer_ids_by_disaster(disaster_id: str) -> Optional[List[str]]:
    """
    Return list of UIDs for volunteers (role='volunteer') in a disaster.
    - Returns None if the disaster does not exist.
    """
    doc_ref = db.collection("disasters").document(disaster_id)
    snap = doc_ref.get()
    if not snap.exists:
        return None

    # Query volunteer participant IDs from sub-collection
    volunteer_docs = doc_ref.collection("participants") \
                          .where("role", "==", "volunteer") \
                          .stream()
    volunteer_ids = [v.id for v in volunteer_docs]
    return volunteer_ids
