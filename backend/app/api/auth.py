from fastapi import APIRouter, Depends, HTTPException, status
from app.core.firebase import verify_token, get_app          # ← updated
from app.crud.user import create_user, get_user, update_user_availability
from app.schemas.user import User, UserCreate, AvailabilityUpdate
from app.api.deps import (
    _parse_authorization_header,
    get_current_user,
)

router = APIRouter(prefix="/users", tags=["auth"])


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


@router.patch(
    "/me/availability",
    response_model=User,
    summary="Volunteers only: set your availability flag",
)
async def set_my_availability(
    body: AvailabilityUpdate,
    current_user: User = Depends(get_current_user),
):
    if current_user.role_id != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only volunteers may update availability"
        )

    # forward the optional location
    update_user_availability(
        current_user.uid,
        body.availability,
        body.location
    )

    updated = get_user(current_user.uid)
    if not updated:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return updated


@router.get(
    "/me/availability",
    response_model=AvailabilityUpdate,
    summary="Volunteers only: get your current availability flag",
)
async def get_my_availability(
    current_user: User = Depends(get_current_user),
):
    if current_user.role_id != "volunteer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only volunteers may read availability"
        )
    # Assuming `current_user` has an `availability: bool` field
    return AvailabilityUpdate(availability=current_user.availability)