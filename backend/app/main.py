from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .api.deps import get_current_user

from .api.requests import router as requests_router
from .api.task import router as tasks_router
from .api.resource import router as resources_router
from .api.auth import router as auth_router
from .api.disaster import router as disaster_router
from .api.chat import router as chat_router
from .api.agent import router as agent_router

from app.schemas.user import User 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

## Uncomment this ONLY when testing the backend Endpoints 

# if os.getenv("ENV", "development") == "development":
#     async def _fake_user() -> User:
#         return User(
#             uid="savinu",
#             email="dev@example.com",
#             role_id="admin",          # role you want to test
#             display_name="savinu",
#             role=None,                
#         )

#     app.dependency_overrides[get_current_user] = _fake_user


app.include_router(requests_router)
app.include_router(tasks_router)
app.include_router(resources_router)
app.include_router(auth_router)
app.include_router(disaster_router)
app.include_router(chat_router)
app.include_router(agent_router)


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok"}
