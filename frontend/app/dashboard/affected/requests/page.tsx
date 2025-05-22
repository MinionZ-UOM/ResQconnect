"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChatInterface } from "@/components/chat/chat-interface"
import { MapPin, AlertTriangle, Clock, Edit, Trash, Plus, MessageSquare } from "lucide-react"
import type { Request, RequestType, RequestStatus, RequestPriority, Disaster } from "@/lib/types"
import Link from "next/link"

export default function AffectedRequestsPage() {
  const searchParams = useSearchParams()
  const disasterId = searchParams.get("disasterId")

  const [typeFilter, setTypeFilter] = useState<RequestType | "All">("All")
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "All">("All")
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // Edit form state
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editType, setEditType] = useState<RequestType | "">("")
  const [editPriority, setEditPriority] = useState<RequestPriority | "">("")
  const [cancelReason, setCancelReason] = useState("")

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
  ]

  // Mock requests - in a real app, these would come from an API
  const mockRequests: Request[] = [
    {
      id: "REQ-001",
      disasterId: "disaster-001",
      title: "Need medical assistance for elderly parent",
      description:
        "My 78-year-old father needs his medication. He has diabetes and we had to evacuate without his insulin.",
      type: "Medical",
      status: "InProgress",
      priority: "High",
      location: { latitude: 38.5816, longitude: -121.4944, address: "Evacuation Center, 123 Main St, Sacramento, CA" },
      createdBy: "user-105", // Current user
      assignedTo: "user-101",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "REQ-002",
      disasterId: "disaster-001",
      title: "Family of 4 needs shelter",
      description:
        "Our home was damaged in the wildfire. We need temporary shelter for 2 adults and 2 children (ages 5 and 8).",
      type: "Shelter",
      status: "Assigned",
      priority: "High",
      location: { latitude: 38.5816, longitude: -121.4944, address: "Parking lot of Walmart, Sacramento, CA" },
      createdBy: "user-105", // Current user
      assignedTo: "user-102",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: "REQ-003",
      disasterId: "disaster-002",
      title: "Need drinking water",
      description: "We're running out of clean drinking water. Family of 3 adults.",
      type: "Food",
      status: "New",
      priority: "Medium",
      location: { latitude: 29.7604, longitude: -95.3698, address: "42 Oak Street, Houston, TX" },
      createdBy: "user-105", // Current user
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: "REQ-004",
      disasterId: "disaster-001",
      title: "Pet rescue needed",
      description:
        "Had to leave our cat behind during evacuation. Please help rescue her. She's in the garage of our home.",
      type: "Rescue",
      status: "Completed",
      priority: "Medium",
      location: { latitude: 38.5816, longitude: -121.4944, address: "567 Pine Street, Sacramento, CA" },
      createdBy: "user-105", // Current user
      assignedTo: "user-103",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    },
  ]

  // Filter requests based on disasterId if provided
  const filteredRequests = disasterId
    ? mockRequests.filter((request) => request.disasterId === disasterId)
    : mockRequests

  // Apply additional filters
  const filteredAndSortedRequests = filteredRequests
    .filter((request) => {
      const matchesType = typeFilter === "All" || request.type === typeFilter
      const matchesStatus = statusFilter === "All" || request.status === statusFilter
      return matchesType && matchesStatus
    })
    .sort((a, b) => {
      // Sort by status (New > Assigned > InProgress > Completed > Cancelled)
      const statusOrder = { New: 0, Assigned: 1, InProgress: 2, Completed: 3, Cancelled: 4 }
      const statusDiff =
        statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]

      if (statusDiff !== 0) return statusDiff

      // Then sort by priority (Critical > High > Medium > Low)
      const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
      return (
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder]
      )
    })

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request)
    setIsDetailsOpen(true)
    setActiveTab("details")
  }

  const handleOpenChat = (request: Request) => {
    setSelectedRequest(request)
    setIsDetailsOpen(true)
    setActiveTab("chat")
  }

  const handleEditRequest = (request: Request) => {
    setSelectedRequest(request)
    setEditTitle(request.title)
    setEditDescription(request.description)
    setEditType(request.type)
    setEditPriority(request.priority)
    setIsEditOpen(true)
  }

  const handleCancelRequest = (request: Request) => {
    setSelectedRequest(request)
    setCancelReason("")
    setIsCancelOpen(true)
  }

  const submitEditRequest = () => {
    if (!selectedRequest) return

    // In a real app, this would be an API call to update the request
    console.log("Updating request:", {
      id: selectedRequest.id,
      title: editTitle,
      description: editDescription,
      type: editType,
      priority: editPriority,
    })

    // Mock update
    alert("Request updated successfully")
    setIsEditOpen(false)
  }

  const submitCancelRequest = () => {
    if (!selectedRequest) return

    // In a real app, this would be an API call to cancel the request
    console.log("Cancelling request:", {
      id: selectedRequest.id,
      reason: cancelReason,
    })

    // Mock update
    alert("Request cancelled successfully")
    setIsCancelOpen(false)
  }

  const getPriorityBadge = (priority: RequestPriority) => {
    switch (priority) {
      case "Critical":
        return <Badge variant="destructive">Critical</Badge>
      case "High":
        return (
          <Badge variant="default" className="bg-orange-500">
            High
          </Badge>
        )
      case "Medium":
        return (
          <Badge variant="default" className="bg-yellow-500">
            Medium
          </Badge>
        )
      case "Low":
        return (
          <Badge variant="default" className="bg-green-500">
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case "New":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            New
          </Badge>
        )
      case "Assigned":
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-500">
            Assigned
          </Badge>
        )
      case "InProgress":
        return (
          <Badge variant="default" className="bg-yellow-500">
            In Progress
          </Badge>
        )
      case "Completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Completed
          </Badge>
        )
      case "Cancelled":
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getDisasterName = (disasterId: string) => {
    const disaster = mockDisasters.find((d) => d.id === disasterId)
    return disaster ? disaster.name : "Unknown Disaster"
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
            {disasterId ? `My Requests for ${getDisasterName(disasterId)}` : "My Requests"}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Track and manage your assistance requests</p>
        </div>

        <Button asChild>
          <Link href={`/dashboard/affected/new-request${disasterId ? `?disasterId=${disasterId}` : ""}`}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Link>
        </Button>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Request Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Request Type</label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as RequestType | "All")}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Shelter">Shelter</SelectItem>
                  <SelectItem value="Evacuation">Evacuation</SelectItem>
                  <SelectItem value="Rescue">Rescue</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RequestStatus | "All")}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="InProgress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
          <CardDescription>{filteredAndSortedRequests.length} requests found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedRequests.length > 0 ? (
                  filteredAndSortedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.type}</Badge>
                      </TableCell>
                      <TableCell>{request.title}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(request)}>
                            View
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleOpenChat(request)}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          {(request.status === "New" || request.status === "Assigned") && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleEditRequest(request)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500"
                                onClick={() => handleCancelRequest(request)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-slate-500">
                      No requests found matching the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>Information about your assistance request</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="chat">Communication</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{selectedRequest.title}</h2>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(selectedRequest.priority)}
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                  <p className="text-slate-600 dark:text-slate-400">{selectedRequest.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Request Type</h3>
                    <Badge variant="outline">{selectedRequest.type}</Badge>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Disaster</h3>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{getDisasterName(selectedRequest.disasterId)}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Location</h3>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedRequest.location.address}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Created</h3>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {selectedRequest.assignedTo && (
                  <div>
                    <h3 className="font-medium mb-2">Assigned To</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      A responder has been assigned to your request. You can communicate with them using the chat tab.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  {(selectedRequest.status === "New" || selectedRequest.status === "Assigned") && (
                    <>
                      <Button variant="outline" onClick={() => handleEditRequest(selectedRequest)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Request
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-500"
                        onClick={() => handleCancelRequest(selectedRequest)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Cancel Request
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="chat">
                <div className="h-[500px]">
                  <ChatInterface
                    currentUserId="user-105"
                    currentUserRole="Affected"
                    disasterId={selectedRequest.disasterId}
                    requestId={selectedRequest.id}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Request Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Request</DialogTitle>
            <DialogDescription>Update your assistance request details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Brief title of your request"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Detailed description of your request"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Request Type</Label>
                <Select value={editType} onValueChange={(value) => setEditType(value as RequestType)}>
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Medical">Medical</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Shelter">Shelter</SelectItem>
                    <SelectItem value="Evacuation">Evacuation</SelectItem>
                    <SelectItem value="Rescue">Rescue</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={editPriority} onValueChange={(value) => setEditPriority(value as RequestPriority)}>
                  <SelectTrigger id="edit-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitEditRequest}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Request Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Request</DialogTitle>
            <DialogDescription>Are you sure you want to cancel this request?</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Reason for Cancellation</Label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this request"
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelOpen(false)}>
              Keep Request
            </Button>
            <Button variant="destructive" onClick={submitCancelRequest}>
              Cancel Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
