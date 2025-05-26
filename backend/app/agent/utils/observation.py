from typing import List

from app.agent.schemas.observation import Observation
from app.agent.schemas.common import Coordinates
from app.crud.observation import list_observations


def load_observations_by_disaster_id(disaster_id: str, top_k: int) -> List[Observation]:
    """
    Fetch observations for a given disaster from Firestore, sort by created_at,
    and return the latest top_k as agent.Observation objects.
    """
    # pull all matching observations
    responses = list_observations(disaster_id=disaster_id)

    # map into agent Observation and sort
    mapped: List[Observation] = []
    for r in responses:
        coords = None
        if r.latitude is not None and r.longitude is not None:
            coords = Coordinates(lat=r.latitude, lng=r.longitude)

        mapped.append(
            Observation(
                disaster_id=r.disaster_id,
                title=r.title,
                description=r.description,
                urgency=r.urgency,                   # Pydantic will coerce to UrgencyLevel
                location=coords,
                photos=r.image_urls or [],
                posted_time=r.created_at,
            )
        )

    # return top_k by posted_time descending
    return sorted(mapped, key=lambda o: o.posted_time, reverse=True)[:top_k]