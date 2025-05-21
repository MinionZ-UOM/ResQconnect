from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.firebase import verify_token
from app.crud.user import get_user
from app.crud.role import get_role
from app.schemas.user import User


bearer_scheme = HTTPBearer(auto_error=False)


async def _raw_token(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> str:
    if creds is None:
        raise HTTPException(status_code=401, detail="Auth token missing")
    return creds.credentials


async def get_current_user(id_token: str = Depends(_raw_token)) -> User:
    decoded = verify_token(id_token)
    uid = decoded["uid"]

    user = get_user(uid)
    if user is None:
        raise HTTPException(403, "User record not found")
    user.role = get_role(user.role_id)
    return user


def require_roles(*allowed: str):
    """
    Dependency factory. Example:

        @router.get("/admin", dependencies=[require_roles("admin")])
    """

    def guard(user: User = Depends(get_current_user)) -> User:
        if user.role_id not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required roles: {', '.join(allowed)}",
            )
        return user

    return Depends(guard)
