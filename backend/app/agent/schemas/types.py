from enum import Enum

class UrgencyLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class TypeOfNeed(str, Enum):
    medical = "medical"
    food = "food"
    rescue = "rescue"
    shelter = "shelter"
    water = "water"
    evacuation = "evacuation"
    other = "other"

class Action(str, Enum):
    request_extraction = 'request_extraction'
    disaster_assignment = 'disaster_assignment'
    task_creation = 'task_creation'
    task_allocation = 'task_allocation'

class ResourceType(str, Enum):
    VEHICLE = "vehicle"
    FOOD = "food"
    MEDICINE = "medicine"
    WATER = "water"
    CLOTHING = "clothing"
    SHELTER = "shelter"
    RESCUE_EQUIPMENT = "rescue_equipment"
    COMMUNICATION_DEVICE = "communication_device"
    POWER_SUPPLY = "power_supply"
    SANITATION_KIT = "sanitation_kit"
    FUEL = "fuel"
    MEDICAL_KIT = "medical_kit"

class DonorType(str, Enum):
    VOLUNTEER = 'volunteer'
    ADMIN = "admin"

class StatusType(str, Enum):
    ACTIVE = 'active'
    INACTIVE = "inactive"
    IN_USE = 'in_use'

class AcceptedType(str, Enum):
    YES = 'yes'
    NO = 'no'
    PENDING = 'pending'