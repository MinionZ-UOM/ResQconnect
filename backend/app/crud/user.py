from typing import Optional
from fastapi import HTTPException, status
from app.core.firebase import users_ref
from app.schemas.user import User
from google.cloud import firestore 

def get_user(uid: str) -> Optional[User]:
    doc = users_ref().document(uid).get()
    if not doc.exists:
        return None
    return User(**doc.to_dict()) 


def create_user(
    uid: str,
    email: str,
    display_name: str | None = None,
    role_id: str = "affected_individual",
) -> None:
    """
    Provision a Firestore record for a brand-new Firebase account.
    """
    users_ref().document(uid).set(
        {
            "uid": uid,
            "email": email,
            "display_name": display_name,
            "role_id": role_id,
            "created_at": firestore.SERVER_TIMESTAMP,
        },
        merge=True,
    )


def update_user_availability(uid: str, availability: bool) -> None:
    # fetch current user
    user_doc = users_ref().document(uid).get()
    if not user_doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user_data = user_doc.to_dict()
    if user_data.get("role_id") != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only volunteers may set availability"
        )

    # perform the update
    users_ref().document(uid).update({"availability": availability})