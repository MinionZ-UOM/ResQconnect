"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash, MapPin } from "lucide-react"
import type { Resource, ResourceType, ResourceStatus, Disaster } from "@/lib/types"

export default function ResourcesPage() {
  const [selectedDisaster, setSelectedDisaster] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<ResourceType | "All">("All")
  const [statusFilter, setStatusFilter] = useState<ResourceStatus | "All">("All")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state for adding a new resource
  const [resourceName, setResourceName] = useState("")
  const [resourceType, setResourceType] = useState<ResourceType | "">("")
  const [resourceQuantity, setResourceQuantity] = useState(1)
  const [resourceLocation, setResourceLocation] = useState("")

  // Mock disasters - in a real app, this would come from an API
  const mockDisasters: Disaster[] = [
    {
      id: "disaster-001",
      name: "California Wildfire",
      type: "Wildfire",
      status: "Active",
      description: "Rapidly spreading wildfire in Northern California affecting multiple counties.",
      location: { latitude: 38.5816, longitude: -121.4944, address: "Sacramento, CA" },
      affectedArea: { radius: 50 },
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      severity: 4,
      impactedPopulation: 25000,
      createdBy: "admin-001",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: "disaster-002",
      name: "Hurricane Maria",
      type: "Hurricane",
      status: "Active",
      description: "Category 3 hurricane approaching the Gulf Coast with heavy rainfall and strong winds.",
      location: { latitude: 29.7604, longitude: -95.3698, address: "Houston, TX" },
      affectedArea: { radius: 100 },
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      severity: 5,
      impactedPopulation: 50000,
      createdBy: "admin-001",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "disaster-003",
      name: "Midwest Flooding",
      type: "Flood",
      status: "Active",
      description: "Severe flooding along the Mississippi River affecting multiple states.",
      location: { latitude: 38.627, longitude: -90.1994, address: "St. Louis, MO" },
      affectedArea: { radius: 75 },
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      severity: 3,
      impactedPopulation: 15000,
      createdBy: "admin-001",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
  ]

  // Mock resources - in a real app, this would come from an API
  const mockResources: Resource[] = [
    {
      id: "resource-001",
      disasterId: "disaster-001",
      name: "Ambulance",
      type: "Vehicle",
      status: "Available",
      quantity: 5,
      location: { latitude: 38.5816, longitude: -121.4944, address: "Sacramento Medical Center" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: "resource-002",
      disasterId: "disaster-001",
      name: "Fire Truck",
      type: "Vehicle",
      status: "InUse",
      quantity: 3,
      location: { latitude: 38.5816, longitude: -121.4944, address: "Sacramento Fire Department" },
      assignedTo: "user-101",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "resource-003",
      disasterId: "disaster-001",
      name: "Medical Supplies",
      type: "Medical",
      status: "Available",
      quantity: 200,
      location: { latitude: 38.5816, longitude: -121.4944, address: "Sacramento Medical Center" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      id: "resource-004",
      disasterId: "disaster-002",
      name: "Rescue Boat",
      type: "Vehicle",
      status: "Available",
      quantity: 10,
      location: { latitude: 29.7604, longitude: -95.3698, address: "Houston Coast Guard Station" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    },
    {
      id: "resource-005",
      disasterId: "disaster-002",
      name: "Emergency Food Supplies",
      type: "Food",
      status: "Available",
      quantity: 1000,
      location: { latitude: 29.7604, longitude: -95.3698, address: "Houston Convention Center" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    },
    {
      id: "resource-006",
      disasterId: "disaster-003",
      name: "Sandbags",
      type: "Equipment",
      status: "Available",
      quantity: 5000,
      location: { latitude: 38.627, longitude: -90.1994, address: "St. Louis Public Works" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    },
    {
      id: "resource-007",
      disasterId: "disaster-003",
      name: "Water Pumps",
      type: "Equipment",
      status: "InUse",
      quantity: 15,
      location: { latitude: 38.627, longitude: -90.1994, address: "St. Louis Riverfront" },
      assignedTo: "user-103",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    },
  ]

  // Filter resources based on search query, type filter, and status filter
  const filteredResources = mockResources.filter((resource) => {
    const matchesSearch = searchQuery === "" || resource.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "All" || resource.type === typeFilter
    const matchesStatus = statusFilter === "All" || resource.status === statusFilter
    const matchesDisaster = !selectedDisaster || resource.disasterId === selectedDisaster

    return matchesSearch && matchesType && matchesStatus && matchesDisaster
  })

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call to create the resource
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Resource added:", {
        disasterId: selectedDisaster,
        name: resourceName,
        type: resourceType,
        quantity: resourceQuantity,
        location: resourceLocation,
      })

      // Reset form
      setResourceName("")
      setResourceType("")
      setResourceQuantity(1)
      setResourceLocation("")
      setIsAddDialogOpen(false)

      // Show success message
      alert("Resource added successfully!")
    } catch (error) {
      console.error("Error adding resource:", error)
      alert("Error adding resource. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: ResourceStatus) => {
    switch (status) {
      case "Available":
        return <Badge className="bg-green-500">Available</Badge>
      case "InUse":
        return <Badge className="bg-blue-500">In Use</Badge>
      case "Maintenance":
        return <Badge className="bg-yellow-500">Maintenance</Badge>
      case "Depleted":
        return <Badge className="bg-red-500">Depleted</Badge>
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">Resource Management</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and track resources for disaster response</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
              <DialogDescription>Add a new resource to the system for disaster response.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddResource}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="disaster">Disaster</Label>
                  <Select value={selectedDisaster} onValueChange={setSelectedDisaster} required>
                    <SelectTrigger id="disaster">
                      <SelectValue placeholder="Select disaster" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDisasters.map((disaster) => (
                        <SelectItem key={disaster.id} value={disaster.id}>
                          {disaster.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Resource Name</Label>
                  <Input
                    id="name"
                    value={resourceName}
                    onChange={(e) => setResourceName(e.target.value)}
                    placeholder="E.g., Ambulance, Medical Supplies"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Resource Type</Label>
                  <Select
                    value={resourceType}
                    onValueChange={(value) => setResourceType(value as ResourceType)}
                    required
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vehicle">Vehicle</SelectItem>
                      <SelectItem value="Medical">Medical</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Shelter">Shelter</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Personnel">Personnel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={resourceQuantity}
                    onChange={(e) => setResourceQuantity(Number.parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={resourceLocation}
                    onChange={(e) => setResourceLocation(e.target.value)}
                    placeholder="E.g., Sacramento Medical Center"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting || !selectedDisaster || !resourceName || !resourceType}>
                  {isSubmitting ? "Adding..." : "Add Resource"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resource Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="disaster-filter">Disaster</Label>
              <Select value={selectedDisaster} onValueChange={setSelectedDisaster}>
                <SelectTrigger id="disaster-filter">
                  <SelectValue placeholder="All Disasters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Disasters</SelectItem>
                  {mockDisasters.map((disaster) => (
                    <SelectItem key={disaster.id} value={disaster.id}>
                      {disaster.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter">Resource Type</Label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ResourceType | "All")}>
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Vehicle">Vehicle</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Shelter">Shelter</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Personnel">Personnel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ResourceStatus | "All")}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="InUse">In Use</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Depleted">Depleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search resources..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>{filteredResources.length} resources found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Disaster</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => {
                  const disaster = mockDisasters.find((d) => d.id === resource.disasterId)
                  return (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{resource.type}</Badge>
                      </TableCell>
                      <TableCell>{resource.quantity}</TableCell>
                      <TableCell>{getStatusBadge(resource.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{resource.location?.address || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{disaster?.name || "Unknown"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredResources.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-slate-500">
                      No resources found matching the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
