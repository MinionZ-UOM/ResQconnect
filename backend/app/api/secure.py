from fastapi import APIRouter, Depends      
from .deps import get_current_user, require_roles
from app.schemas.user import User

router = APIRouter(prefix="/secure", tags=["secure"])

# ────────────────────────────────────────────────────────────────────────── #
#  authenticated ➜ any signed-in user
# ────────────────────────────────────────────────────────────────────────── #
@router.get("/profile", response_model=User)
async def profile(user: User = Depends(get_current_user)):   
    return user

# ────────────────────────────────────────────────────────────────────────── #
#  admin-only
# ────────────────────────────────────────────────────────────────────────── #
@router.get("/admin")
async def admin_panel(user: User = require_roles("admin")):
    return {"msg": f"Welcome, admin {user.display_name or user.email}!"}