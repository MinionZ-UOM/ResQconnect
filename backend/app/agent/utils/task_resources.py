# app/agent/utils/task_resources.py

from datetime import datetime, timezone
from typing import List, Dict
from app.core.firebase import get_db

def save_request_resources(request_id: str, entries: List[Dict]) -> None:
    """
    Persist resource_requirements + manpower_requirement per task
    under the 'request_resources' collection, one document per task_id.
    """
    db = get_db()
    for entry in entries:
        task_id = entry["task_id"]
        # Use the task_id as the document ID
        db.collection("request_resources") \
          .document(task_id) \
          .set({
              "request_id": request_id,
              "resource_requirements": entry.get("resource_requirements", []),
              "manpower_requirement": entry.get("manpower_requirement"),
              "created_at": datetime.now(timezone.utc),
          })