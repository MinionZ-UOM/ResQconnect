# app/agent/utils/task_resources.py

from datetime import datetime, timezone
from typing import List, Dict
from app.core.firebase import get_db

def save_request_resources(request_id: str, entries: List[Dict]) -> None:
    """
    Persist resource_requirements + manpower_requirement per task
    under the 'request_resources' collection keyed by request_id.
    """
    db = get_db()
    db.collection("request_resources") \
      .document(request_id) \
      .set({
          "tasks": entries,
          "created_at": datetime.now(timezone.utc),
      })
