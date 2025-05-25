from typing import Optional
from app.agent.schemas.common import Coordinates
from geopy.geocoders import Nominatim

def get_location(coordinates: Coordinates) -> Optional[str]:
    print('Inside get_location tool')
    print(f'lat:{coordinates.latitude}, lon:{coordinates.longitude}')
    
    try:
        geolocator = Nominatim(user_agent="disaster-locator")
        location = geolocator.reverse((coordinates.latitude, coordinates.longitude), exactly_one=True, timeout=10)
        return location.address if location else None
    except Exception as e:
        print(f"Error during reverse geocoding: {e}")
        return None