from typing import List
from app.crud.user import get_user_ids_by_role_id


def get_admin_ids() -> List[str]:
    """
    Return just the UIDs of all volunteers in the disaster.
    """
    backend_ids = get_user_ids_by_role_id('admin')
    if backend_ids is None:
        # disaster not found
        return []
    return backend_ids