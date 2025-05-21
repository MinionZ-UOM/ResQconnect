from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .api.deps import get_current_user

from .api.secure import router as secure_router
from .api.requests import router as requests_router

from app.schemas.user import User 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.getenv("ENV", "development") == "development":
    async def _fake_user() -> User:
        return User(
            uid="dev_user_1",
            email="dev@example.com",
            role_id="admin",          # whatever role you want to test
            display_name="Dev User",
            role=None,                
        )

    app.dependency_overrides[get_current_user] = _fake_user

app.include_router(secure_router)
app.include_router(requests_router)

@app.get("/", tags=["health"])
async def root():
    return {"status": "ok"}
