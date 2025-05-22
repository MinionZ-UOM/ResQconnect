"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RequestDetails } from "@/components/requests/request-details"
import type { Request, RequestStatus, RequestPriority } from "@/lib/types"
import { MoreHorizontal, Eye, CheckCircle, Clock, AlertTriangle } from "lucide-react"

interface RequestsListProps {
  role: string
  filter: "all" | RequestStatus
}

export function RequestsList({ role, filter }: RequestsListProps) {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Mock requests data - in a real app, this would come from an API
  const mockRequests: Request[] = [
    {
      id: "REQ-001",
      title: "Medical assistance needed",
      description: "Elderly person with diabetes needs insulin",
      type: "Medical",
      status: "New",
      priority: "High",
      location: { latitude: 34.0522, longitude: -118.2437, address: "123 Main St, Los Angeles" },
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
      location: { latitude: 34.0522, longitude: -118.2437, address: "456 Oak St, Los Angeles" },
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
      location: { latitude: 34.0522, longitude: -118.2437, address: "789 Pine St, Los Angeles" },
      createdBy: "user-003",
      assignedTo: "user-102",
      createdAt: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: "REQ-004",
      title: "Temporary shelter needed",
      description: "Family lost home in earthquake, needs temporary housing",
      type: "Shelter",
      status: "Completed",
      priority: "High",
      location: { latitude: 34.0522, longitude: -118.2437, address: "101 Elm St, Los Angeles" },
      createdBy: "user-004",
      assignedTo: "user-103",
      createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    },
    {
      id: "REQ-005",
      title: "Rescue from collapsed building",
      description: "Person trapped in partially collapsed building",
      type: "Rescue",
      status: "New",
      priority: "Critical",
      location: { latitude: 34.0522, longitude: -118.2437, address: "202 Cedar St, Los Angeles" },
      createdBy: "user-005",
      createdAt: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 10),
    },
  ]

  // Filter requests based on role and filter
  const filteredRequests = mockRequests
    .filter((request) => {
      if (filter !== "all") {
        return request.status === filter
      }
      return true
    })
    .filter((request) => {
      if (role === "affected") {
        return request.createdBy === "user-001" // Mock current user
      }
      if (role === "volunteer" || role === "responder") {
        return request.assignedTo === "user-101" || !request.assignedTo // Mock current user or unassigned
      }
      return true // Admin sees all
    })

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request)
    setIsDetailsOpen(true)
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

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case "New":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "Assigned":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "InProgress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Cancelled":
        return <AlertTriangle className="h-4 w-4 text-slate-500" />
      default:
        return null
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.type}</Badge>
                  </TableCell>
                  <TableCell>{request.title}</TableCell>
                  <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span>{request.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(request.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(request)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {role === "responder" && request.status === "New" && (
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Assign to Me
                          </DropdownMenuItem>
                        )}
                        {(role === "responder" || role === "volunteer") &&
                          (request.status === "Assigned" || request.status === "InProgress") && (
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Completed
                            </DropdownMenuItem>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-slate-500">
                  No requests found matching the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>Detailed information about the request</DialogDescription>
          </DialogHeader>
          {selectedRequest && <RequestDetails request={selectedRequest} role={role} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
