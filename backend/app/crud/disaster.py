# app/crud/disaster.py
from typing import List, Optional
from firebase_admin import firestore
from datetime import datetime, timezone

from app.core.firebase import get_db
from app.schemas.disaster import DisasterCreate, DisasterResponse

db = get_db()


def create_disaster(payload: DisasterCreate, admin_uid: str) -> DisasterResponse:
    batch = db.batch()
    disaster_ref = db.collection("disasters").document()
    chat_ref     = db.collection("chatSessions").document()

    now = firestore.SERVER_TIMESTAMP
    batch.set(
        disaster_ref,
        {
            **payload.dict(),
            "created_at": now,
            "created_by": admin_uid,
            "chat_session_id": chat_ref.id,
        },
    )
    batch.set(chat_ref, {"disaster_id": disaster_ref.id, "created_at": now})
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
    doc = db.collection("disasters").document(disaster_id).get()
    if not doc.exists:
        return None
    return DisasterResponse(id=doc.id, **doc.to_dict())


def join_disaster(disaster_id: str, uid: str, role: str) -> None:
    (
        db.collection("disasters")
          .document(disaster_id)
          .collection("participants")
          .document(uid)
          .set({"role": role, "joined_at": firestore.SERVER_TIMESTAMP}, merge=True)
    )

def leave_disaster(disaster_id: str, uid: str) -> None:
    (
        db.collection("disasters")
          .document(disaster_id)
          .collection("participants")
          .document(uid)
          .delete()
    )
