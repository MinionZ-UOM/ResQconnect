// File: /components/disasters/DisasterDetailModal.tsx
"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

export interface Disaster {
  id: string
  name: string
  description: string
  location: { lat: number; lng: number }
  image_urls: string[]
  created_at: string
  created_by: string
  chat_session_id: string
  type?: string
  severity?: string
  affected_count?: number
}

interface DisasterDetailModalProps {
  disaster: Disaster | null
  onClose: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DisasterDetailModal({
  disaster,
  onClose,
  open,
  onOpenChange,
}: DisasterDetailModalProps) {
  if (!disaster) return null

  const startedDate = new Date(disaster.created_at).toLocaleDateString()
  const imgSrc = disaster.image_urls.length
    ? disaster.image_urls[0]
    : "/placeholder.svg?height=300&width=600"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="relative">
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Header Section */}
          <CardHeader className="bg-gray-50">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <CardTitle className="text-2xl font-semibold">
                {disaster.name}
              </CardTitle>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Created on: <strong>{startedDate}</strong>
            </p>
          </CardHeader>

          {/* Main Content Grid */}
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Left Column: Image + Basic Info */}
            <div className="space-y-4">
              <div
                className="h-60 bg-cover bg-center rounded-md overflow-hidden"
                style={{ backgroundImage: `url('${imgSrc}')` }}
              />
              <div className="space-y-2">
                <div>
                  <h3 className="font-medium text-sm text-gray-600">Type</h3>
                  <p className="text-gray-800">{disaster.type ?? "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-600">
                    Severity
                  </h3>
                  <p className="text-gray-800">{disaster.severity ?? "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-600">
                    Affected Count
                  </h3>
                  <p className="text-gray-800">
                    {disaster.affected_count ?? "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-600">Location</h3>
                  <p className="text-gray-800">
                    Lat: {disaster.location.lat}, Lng: {disaster.location.lng}
                  </p>
                </div>
                {/* <div>
                  <h3 className="font-medium text-sm text-gray-600">
                    Created By
                  </h3>
                  <p className="text-gray-800">{disaster.created_by}</p>
                </div> */}
                {/* <div>
                  <h3 className="font-medium text-sm text-gray-600">
                    Chat Session ID
                  </h3>
                  <p className="text-gray-800">{disaster.chat_session_id}</p>
                </div> */}
              </div>
            </div>

            {/* Right Column: Description + Specific Sections */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-medium text-sm text-gray-600">
                  Description
                </h3>
                <p className="text-gray-800">{disaster.description}</p>
              </div>

              {/* Separator */}
              <hr className="border-gray-200" />

              {/* Wildfire Section */}
              {disaster.type === "Wildfire" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-600">
                    Wildfire Heat Map & Stats
                  </h3>
                  <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center">
                    {/* Placeholder for heat map */}
                    <img
                      src="/wildfire-heatmap-placeholder.png"
                      alt="Wildfire Heat Map"
                      className="max-h-36 object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Current Temperature
                      </h4>
                      <p className="text-gray-800">102°F</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Area Burned
                      </h4>
                      <p className="text-gray-800">1,500 acres</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Containment
                      </h4>
                      <p className="text-gray-800">45%</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Wind Speed
                      </h4>
                      <p className="text-gray-800">15 mph</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Flood Section */}
              {disaster.type === "Flood" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-600">
                    Flood Depth Analysis & Zones
                  </h3>
                  <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center">
                    {/* Placeholder for flood depth chart */}
                    <img
                      src="/flood-depth-placeholder.png"
                      alt="Flood Depth Chart"
                      className="max-h-36 object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Current Water Depth
                      </h4>
                      <p className="text-gray-800">6 ft</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Predicted Flood Extent
                      </h4>
                      <p className="text-gray-800">2,000 sq mi</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Evacuation Zone
                      </h4>
                      <p className="text-gray-800">Zone A</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Earthquake Section */}
              {disaster.type === "Earthquake" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-yellow-700">
                    Earthquake Details & Epicenter
                  </h3>
                  <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center">
                    {/* Placeholder for epicenter map */}
                    <img
                      src="/earthquake-epicenter-placeholder.png"
                      alt="Earthquake Epicenter Map"
                      className="max-h-36 object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Magnitude
                      </h4>
                      <p className="text-gray-800">6.8 Mw</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Depth
                      </h4>
                      <p className="text-gray-800">10 km</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Epicenter Coordinates
                      </h4>
                      <p className="text-gray-800">Lat: 35.689, Lng: 139.692</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Felt Reports
                      </h4>
                      <p className="text-gray-800">58,000+ reports</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Hurricane Section */}
              {disaster.type === "Hurricane" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-teal-700">
                    Hurricane Track & Stats
                  </h3>
                  <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center">
                    {/* Placeholder for hurricane track map */}
                    <img
                      src="/hurricane-track-placeholder.png"
                      alt="Hurricane Track Map"
                      className="max-h-36 object-contain"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Category
                      </h4>
                      <p className="text-gray-800">Category 4</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Wind Speed
                      </h4>
                      <p className="text-gray-800">130 mph</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Pressure
                      </h4>
                      <p className="text-gray-800">945 mb</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Current Direction
                      </h4>
                      <p className="text-gray-800">NW at 15 mph</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tornado Section */}
              {disaster.type === "Tornado" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-700">
                    Tornado Path & EF Scale
                  </h3>
                  <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center">
                    {/* Placeholder for tornado path diagram */}
                    <img
                      src="/tornado-path-placeholder.png"
                      alt="Tornado Path Diagram"
                      className="max-h-36 object-contain"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        EF Scale Rating
                      </h4>
                      <p className="text-gray-800">EF3</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Path Length
                      </h4>
                      <p className="text-gray-800">12 miles</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Max Width
                      </h4>
                      <p className="text-gray-800">1,200 yd</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600">
                        Duration
                      </h4>
                      <p className="text-gray-800">15 minutes</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Add additional disaster-specific blocks here as needed */}
            </div>
          </CardContent>

          {/* Footer with Close Button */}
          <div className="flex justify-end px-6 pb-6">
            <Button
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
            >
              Close
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
