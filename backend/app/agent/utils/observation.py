import json
from pathlib import Path
from typing import List

from app.agent.schemas.observation import Observation
# from app.agent.schemas.observation import Observation


def load_observations_by_disaster_id(disaster_id: str, top_k: int) -> List[Observation]:
    print('inside load_observations_by_disaster_id tool')
    
    OBSERVATIONS_FILE = "app/agent/data/observations.json"

    if not Path(OBSERVATIONS_FILE).exists():
        return []

    with open(OBSERVATIONS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    

    # Filter observations by disaster_id
    observations = [
        Observation(**item)
        for item in data
        if item["disaster_id"] == disaster_id
    ]

    # Sort by posted_time descending and return the latest 3
    latest_observations = sorted(
        observations,
        key=lambda obs: obs.posted_time,
        reverse=True
    )[:top_k]

    return latest_observations