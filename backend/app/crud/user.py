from typing import Optional

from app.core.firebase import users_ref
from app.schemas.user import User


def get_user(uid: str) -> Optional[User]:
    doc = users_ref().document(uid).get()
    if not doc.exists:
        return None
    return User(uid=doc.id, **doc.to_dict())
