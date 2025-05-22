// User Types
export type UserRole = "Responder" | "Volunteer" | "Affected" | "Admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  location?: GeoLocation
  skills?: string[]
  availability?: boolean
  createdAt: Date
}

// Disaster Types
export type DisasterType = "Flood" | "Earthquake" | "Wildfire" | "Hurricane" | "Tornado" | "Other"
export type DisasterStatus = "Active" | "Contained" | "Recovery" | "Resolved"

export interface Disaster {
  id: string
  name: string
  type: DisasterType
  status: DisasterStatus
  description: string
  location: GeoLocation
  affectedArea: {
    radius: number // in kilometers
    polygonCoordinates?: GeoLocation[] // for more precise area definition
  }
  startDate: Date
  endDate?: Date
  severity: 1 | 2 | 3 | 4 | 5 // 1-5 scale, 5 being most severe
  impactedPopulation?: number
  mediaUrls?: string[]
  createdBy: string // Admin ID
  createdAt: Date
  updatedAt: Date
}

// Request Types
export type RequestStatus = "New" | "Assigned" | "InProgress" | "Completed" | "Cancelled"
export type RequestType = "Medical" | "Food" | "Shelter" | "Evacuation" | "Rescue" | "Other"
export type RequestPriority = "Low" | "Medium" | "High" | "Critical"

export interface Request {
  id: string
  disasterId: string // Associated disaster
  title: string
  description: string
  type: RequestType
  status: RequestStatus
  priority: RequestPriority
  location: GeoLocation
  createdBy: string // User ID
  assignedTo?: string // User ID
  mediaUrls?: string[]
  aiAnalysis?: AIAnalysis
  createdAt: Date
  updatedAt: Date
}

// Resource Types
export type ResourceType = "Vehicle" | "Medical" | "Food" | "Shelter" | "Equipment" | "Personnel"
export type ResourceStatus = "Available" | "InUse" | "Maintenance" | "Depleted"

export interface Resource {
  id: string
  disasterId: string // Associated disaster
  name: string
  type: ResourceType
  status: ResourceStatus
  quantity: number
  location?: GeoLocation
  assignedTo?: string // User ID
  createdAt: Date
  updatedAt: Date
}

// Task Types
export interface Task {
  id: string
  disasterId: string // Associated disaster
  title: string
  description: string
  requestId?: string
  assignedTo?: string // User ID
  status: RequestStatus
  priority: RequestPriority
  steps?: string[]
  progress?: "Assigned" | "Arrived" | "InProgress" | "Completed"
  estimatedDuration?: number // in minutes
  location: GeoLocation
  createdAt: Date
  updatedAt: Date
}

// Communication Types
export interface Message {
  id: string
  content: string
  senderId: string
  receiverId?: string
  channelId?: string
  disasterId: string // Associated disaster
  requestId?: string
  taskId?: string
  isAIGenerated?: boolean
  attachmentUrls?: string[]
  createdAt: Date
}

export interface Channel {
  id: string
  name: string
  disasterId: string // Associated disaster
  participants: string[] // User IDs
  taskId?: string // Related task/request ID
  isDirectMessage?: boolean
  createdAt: Date
  updatedAt: Date
}

// Alert Types
export interface Alert {
  id: string
  disasterId: string
  title: string
  message: string
  severity: "Info" | "Warning" | "Critical"
  targetRoles?: UserRole[] // If empty, broadcast to all
  targetArea?: {
    location: GeoLocation
    radius: number // in kilometers
  }
  expiresAt?: Date
  createdBy: string // Admin ID
  createdAt: Date
}

// Location Type
export interface GeoLocation {
  latitude: number
  longitude: number
  address?: string
}

// AI Analysis Types
export interface AIAnalysis {
  extractedInfo: {
    urgency?: RequestPriority
    peopleAffected?: number
    resourcesNeeded?: string[]
    hazards?: string[]
  }
  imageAnalysis?: {
    detectedObjects?: string[]
    damageAssessment?: string
    safetyRisks?: string[]
  }
  recommendedActions?: string[]
  confidenceScore?: number
  modelUsed: string
  processingTime: number
}

// Metrics Types
export interface Metrics {
  disasterId: string
  responseTime: number // in minutes
  requestsFulfilled: number
  resourcesDeployed: number
  averageSatisfactionScore?: number
  aiAccuracy?: number
}
