"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Request, Resource, RequestType, RequestStatus, ResourceType } from "@/lib/types"
import { Layers, MapPin, AlertTriangle, Package, User, Filter } from "lucide-react"

interface MapPageProps {
  params: {
    role: string
  }
}

export default function MapPage({ params }: MapPageProps) {
  const role = params.role
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Request | Resource | null>(null)
  const [filters, setFilters] = useState({
    requestTypes: [] as RequestType[],
    requestStatus: [] as RequestStatus[],
    resourceTypes: [] as ResourceType[],
  })

  // Mock data - in a real app, this would come from an API
  const mockRequests: Request[] = [
    {
      id: "REQ-001",
      title: "Medical assistance needed",
      description: "Elderly person with diabetes needs insulin",
      type: "Medical",
      status: "New",
      priority: "High",
      location: { latitude: 34.052, longitude: -118.243, address: "123 Main St, Los Angeles" },
      createdBy: "user-001",
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "REQ-002",
      title: "Family evacuation",
      description: "Family of 5 needs evacuation from flooded area",
      type: "Evacuation",
      status: "Assigned",
      priority: "Critical",
      location: { latitude: 34.058, longitude: -118.235, address: "456 Oak St, Los Angeles" },
      createdBy: "user-002",
      assignedTo: "user-101",
      createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    },
    {
      id: "REQ-003",
      title: "Food supplies for shelter",
      description: "Need food supplies for 50 people at community shelter",
      type: "Food",
      status: "InProgress",
      priority: "Medium",
      location: { latitude: 34.045, longitude: -118.25, address: "789 Pine St, Los Angeles" },
      createdBy: "user-003",
      assignedTo: "user-102",
      createdAt: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
  ]

  const mockResources: Resource[] = [
    {
      id: "RES-001",
      name: "Ambulance",
      type: "Vehicle",
      status: "Available",
      quantity: 1,
      location: { latitude: 34.05, longitude: -118.26, address: "Central Hospital" },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "RES-002",
      name: "Medical Supplies",
      type: "Medical",
      status: "Available",
      quantity: 20,
      location: { latitude: 34.055, longitude: -118.255, address: "Medical Depot" },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "RES-003",
      name: "Rescue Team",
      type: "Personnel",
      status: "InUse",
      quantity: 5,
      location: { latitude: 34.048, longitude: -118.245, address: "Fire Station" },
      assignedTo: "user-101",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleFilterChange = (type: string, value: string, checked?: boolean) => {
    if (type === "requestType") {
      setFilters((prev) => {
        if (checked) {
          return { ...prev, requestTypes: [...prev.requestTypes, value as RequestType] }
        } else {
          return { ...prev, requestTypes: prev.requestTypes.filter((t) => t !== value) }
        }
      })
    } else if (type === "requestStatus") {
      setFilters((prev) => {
        if (checked) {
          return { ...prev, requestStatus: [...prev.requestStatus, value as RequestStatus] }
        } else {
          return { ...prev, requestStatus: prev.requestStatus.filter((s) => s !== value) }
        }
      })
    } else if (type === "resourceType") {
      setFilters((prev) => {
        if (checked) {
          return { ...prev, resourceTypes: [...prev.resourceTypes, value as ResourceType] }
        } else {
          return { ...prev, resourceTypes: prev.resourceTypes.filter((t) => t !== value) }
        }
      })
    }
  }

  const handleItemClick = (item: Request | Resource) => {
    setSelectedItem(item)
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6 ml-8 md:ml-0">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">Map View</h1>
        <p className="text-slate-600 dark:text-slate-400">Geographic overview of requests and resources</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Request Types</h3>
                <div className="space-y-2">
                  {["Medical", "Food", "Shelter", "Evacuation", "Rescue", "Other"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`request-type-${type}`}
                        onCheckedChange={(checked) => handleFilterChange("requestType", type, checked as boolean)}
                      />
                      <Label htmlFor={`request-type-${type}`}>{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Request Status</h3>
                <div className="space-y-2">
                  {["New", "Assigned", "InProgress", "Completed"].map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`request-status-${status}`}
                        onCheckedChange={(checked) => handleFilterChange("requestStatus", status, checked as boolean)}
                      />
                      <Label htmlFor={`request-status-${status}`}>{status}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Resource Types</h3>
                <div className="space-y-2">
                  {["Vehicle", "Medical", "Food", "Shelter", "Equipment", "Personnel"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`resource-type-${type}`}
                        onCheckedChange={(checked) => handleFilterChange("resourceType", type, checked as boolean)}
                      />
                      <Label htmlFor={`resource-type-${type}`}>{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Map Layers</h3>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select layers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Layers</SelectItem>
                    <SelectItem value="requests">Requests Only</SelectItem>
                    <SelectItem value="resources">Resources Only</SelectItem>
                    <SelectItem value="personnel">Personnel Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">
                <Layers className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </CardContent>
          </Card>

          {selectedItem && (
            <Card>
              <CardHeader>
                <CardTitle>{"type" in selectedItem ? "Request Details" : "Resource Details"}</CardTitle>
              </CardHeader>
              <CardContent>
                {"type" in selectedItem ? (
                  // Request details
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">{selectedItem.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{selectedItem.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Type</span>
                        <div>
                          <Badge variant="outline">{selectedItem.type}</Badge>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Priority</span>
                        <div>
                          <Badge
                            variant={
                              selectedItem.priority === "Critical"
                                ? "destructive"
                                : selectedItem.priority === "High"
                                  ? "default"
                                  : "outline"
                            }
                            className={
                              selectedItem.priority === "High"
                                ? "bg-orange-500"
                                : selectedItem.priority === "Medium"
                                  ? "bg-yellow-500"
                                  : selectedItem.priority === "Low"
                                    ? "bg-green-500"
                                    : undefined
                            }
                          >
                            {selectedItem.priority}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
                        <div>
                          <Badge
                            variant={
                              selectedItem.status === "New"
                                ? "destructive"
                                : selectedItem.status === "Completed"
                                  ? "default"
                                  : "outline"
                            }
                            className={
                              selectedItem.status === "Completed"
                                ? "bg-green-500"
                                : selectedItem.status === "InProgress"
                                  ? "bg-yellow-500"
                                  : selectedItem.status === "Assigned"
                                    ? "bg-blue-500"
                                    : undefined
                            }
                          >
                            {selectedItem.status}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Created</span>
                        <div className="text-sm">
                          {new Date(selectedItem.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Location</span>
                      <div className="text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedItem.location.address}
                      </div>
                    </div>

                    {role === "responder" && selectedItem.status === "New" && (
                      <Button className="w-full">Assign to Me</Button>
                    )}
                  </div>
                ) : (
                  // Resource details
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">{selectedItem.name}</h3>
                      <Badge variant="outline">{selectedItem.type}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
                        <div>
                          <Badge
                            variant={
                              selectedItem.status === "Available"
                                ? "default"
                                : selectedItem.status === "InUse"
                                  ? "outline"
                                  : "destructive"
                            }
                            className={
                              selectedItem.status === "Available"
                                ? "bg-green-500"
                                : selectedItem.status === "InUse"
                                  ? "bg-blue-500"
                                  : undefined
                            }
                          >
                            {selectedItem.status}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Quantity</span>
                        <div className="text-sm font-medium">{selectedItem.quantity}</div>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Location</span>
                      <div className="text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedItem.location?.address || "Unknown"}
                      </div>
                    </div>

                    {selectedItem.assignedTo && (
                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Assigned To</span>
                        <div className="text-sm flex items-center gap-1">
                          <User className="h-3 w-3" />
                          User ID: {selectedItem.assignedTo}
                        </div>
                      </div>
                    )}

                    {role === "responder" && selectedItem.status === "Available" && (
                      <Button className="w-full">Deploy Resource</Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-3">
          <Card className="h-[calc(100vh-12rem)]">
            <CardContent className="p-0 h-full">
              {!mapLoaded ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="relative h-full bg-slate-100 dark:bg-slate-800">
                  {/* This would be replaced with an actual map component */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-slate-500 dark:text-slate-400">
                      Map would be displayed here with markers for requests and resources
                    </p>
                  </div>

                  {/* Mock map markers */}
                  {mockRequests.map((request) => (
                    <button
                      key={request.id}
                      className="absolute p-1 rounded-full bg-white shadow-md border border-slate-200 transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${((request.location.longitude + 118.27) / 0.05) * 100}%`,
                        top: `${((34.07 - request.location.latitude) / 0.05) * 100}%`,
                      }}
                      onClick={() => handleItemClick(request)}
                    >
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          request.priority === "Critical"
                            ? "text-red-500"
                            : request.priority === "High"
                              ? "text-orange-500"
                              : request.priority === "Medium"
                                ? "text-yellow-500"
                                : "text-green-500"
                        }`}
                      />
                    </button>
                  ))}

                  {mockResources.map((resource) => (
                    <button
                      key={resource.id}
                      className="absolute p-1 rounded-full bg-white shadow-md border border-slate-200 transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${((resource.location!.longitude + 118.27) / 0.05) * 100}%`,
                        top: `${((34.07 - resource.location!.latitude) / 0.05) * 100}%`,
                      }}
                      onClick={() => handleItemClick(resource)}
                    >
                      <Package
                        className={`h-5 w-5 ${
                          resource.status === "Available"
                            ? "text-green-500"
                            : resource.status === "InUse"
                              ? "text-blue-500"
                              : "text-slate-500"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
