from fastapi import APIRouter, Depends
from app.core.firebase import verify_token, get_app          # ← updated
from app.crud.user import create_user, get_user
from app.schemas.user import User, UserCreate
from app.api.deps import (
    _parse_authorization_header,
    get_current_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=User)
async def register(
    body: UserCreate,
    token: str = Depends(_parse_authorization_header),
):
    get_app()                                # ensure SDK initialised
    decoded = verify_token(token)            # ← uses the safe helper
    uid, email = decoded["uid"], decoded["email"]

    if get_user(uid):
        return await get_current_user(token)  # type: ignore

    role_id = body.role_id or "affected_individual"
    create_user(uid, email, body.display_name, role_id)

    # set_custom_user_claims *after* init
    from firebase_admin import auth as fb_auth
    fb_auth.set_custom_user_claims(uid, {"role": role_id})

    return await get_current_user(token)      # type: ignore


@router.get("/me", response_model=User)
async def me(user: User = Depends(get_current_user)):
    return user
