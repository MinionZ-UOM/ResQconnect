from typing import Optional
from app.agent.schemas.common import Coordinates
from geopy.geocoders import Nominatim

from app.utils.logger import get_logger
logger = get_logger(__name__)

def get_location(coordinates: Coordinates) -> Optional[str]:
    logger.info('Inside get_location tool')
    logger.debug(f'lat:{coordinates.latitude}, lon:{coordinates.longitude}')
    
    try:
        geolocator = Nominatim(user_agent="disaster-locator")
        location = geolocator.reverse((coordinates.latitude, coordinates.longitude), exactly_one=True, timeout=10)
        return location.address if location else None
    except Exception as e:
        logger.error(f"During reverse geocoding: {e}")
        return None