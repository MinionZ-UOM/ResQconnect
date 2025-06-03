"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { ChatInterface } from "@/components/chat/chat-interface"
import {
  Edit,
  Trash,
  MessageSquare,
} from "lucide-react"
import type {
  Request as BackendRequest,
  RequestType,
  RequestStatus,
  RequestPriority,
} from "@/lib/types"
import { callApi } from "@/lib/api"

interface Disaster {
  id: string
  name: string
}

interface Request extends Omit<BackendRequest, "type_of_need" | "status"> {
  type: RequestType
  status: RequestStatus
}

// Use "uid" instead of "id" for current user
interface User {
  uid: string
  role_id: string
}

export default function AdminRequestsPage() {
  // Track whether /users/me is still in flight
  const [userLoading, setUserLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Filters
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [selectedDisaster, setSelectedDisaster] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<RequestType | "All">("All")
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "All">(
    "All"
  )

  // Data
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog state
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [dialogs, setDialogs] = useState({
    details: false,
    edit: false,
    cancel: false,
    chat: false,
  })
  const [activeTab, setActiveTab] = useState<"details" | "chat">("details")
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editType, setEditType] = useState<RequestType | "">("")
  const [editPriority, setEditPriority] = useState<RequestPriority | "">("")

  // Load current user on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await callApi<User>("users/me", "GET")
        console.log("me →", user)
        setCurrentUser(user)
      } catch {
        console.error("Failed to load current user")
      } finally {
        setUserLoading(false)
      }
    }
    loadUser()
  }, [])

  // Load disasters and set default selection
  useEffect(() => {
    async function loadDisasters() {
      try {
        const data = await callApi<Disaster[]>("disasters/", "GET")
        console.log("Loaded disasters:", data)
        setDisasters(data)
        if (data.length > 0) {
          setSelectedDisaster(data[0].id)
        }
      } catch {
        console.error("Failed to load disasters")
      }
    }
    loadDisasters()
  }, [])

  // Fetch requests for selected disaster, filtering by user if needed
  const fetchRequests = useCallback(async () => {
    // If we haven’t finished loading /users/me yet, bail out
    if (userLoading) return
    if (!selectedDisaster) return

    setLoading(true)
    setError(null)
    try {
      const endpoint = `requests/disaster/${selectedDisaster}`
      const data = await callApi<BackendRequest[]>(endpoint, "GET")
      console.log("all requests →", data)

      let filteredData: BackendRequest[] = data

      // Only apply “my-requests” filter if the role is EXACTLY "affected_individual"
      if (
        currentUser &&
        currentUser.role_id === "affected_individual"
      ) {
        filteredData = data.filter((r) => r.created_by === currentUser.uid)
      }

      console.log("filtered as:", filteredData)

      setRequests(
        filteredData.map((r) => ({
          ...r,
          type: r.type_of_need as RequestType,
          status: r.status as RequestStatus,
        }))
      )
    } catch {
      setError("Could not load requests.")
    } finally {
      setLoading(false)
    }
  }, [selectedDisaster, currentUser, userLoading])

  // Trigger fetch when disaster or user changes
  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  // Dialog handlers
  const openDialog = (name: keyof typeof dialogs, req?: Request) => {
    if (req) {
      setSelectedRequest(req)
      if (name === "edit") {
        setEditTitle(req.title)
        setEditDescription(req.description)
        setEditType(req.type)
        setEditPriority(req.priority)
      }
    }
    setDialogs((d) => ({ ...d, [name]: true }))
  }
  const closeDialog = (name: keyof typeof dialogs) =>
    setDialogs((d) => ({ ...d, [name]: false }))

  // Submit edit
  const submitEdit = async () => {
    if (!selectedRequest) return
    await callApi(
      `requests/${selectedRequest.id}`,
      "PUT",
      {
        title: editTitle,
        description: editDescription,
        type_of_need: editType,
        priority: editPriority,
      }
    )
    closeDialog("edit")
    fetchRequests()
  }

  // Submit cancel
  const submitCancel = async () => {
    if (!selectedRequest) return
    await callApi(
      `requests/${selectedRequest.id}/status`,
      "PATCH",
      { status: "Cancelled" }
    )
    closeDialog("cancel")
    fetchRequests()
  }

  // Client-side filter & sort
  const filtered = requests
    .filter((r) => typeFilter === "All" || r.type === typeFilter)
    .filter((r) => statusFilter === "All" || r.status === statusFilter)
    .sort((a, b) => {
      const order = { New: 0, Assigned: 1, InProgress: 2, Completed: 3, Cancelled: 4 }
      const diff = order[a.status] - order[b.status]
      if (diff) return diff
      const pOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
      return pOrder[a.priority] - pOrder[b.priority]
    })

  // Badge helpers
  const getPriorityBadge = (p: RequestPriority) =>
    ({
      Critical: <Badge variant="destructive">Critical</Badge>,
      High:     <Badge className="bg-orange-500">High</Badge>,
      Medium:   <Badge className="bg-yellow-500">Medium</Badge>,
      Low:      <Badge className="bg-green-500">Low</Badge>,
    }[p]!)

  const getStatusBadge = (s: RequestStatus) =>
    ({
      open:       <Badge variant="outline" className="text-blue-500">Open</Badge>,
      Assigned:   <Badge variant="outline" className="text-purple-500">Assigned</Badge>,
      InProgress: <Badge className="bg-yellow-500">In Progress</Badge>,
      Completed:  <Badge className="bg-green-500">Completed</Badge>,
      Cancelled:  <Badge variant="outline" className="text-red-500">Cancelled</Badge>,
    }[s] || <Badge>{s}</Badge>)

  // If the user is still loading, show a placeholder
  if (userLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <p>Loading user…</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 py-3 md:left-64 md:right-0 overflow-auto px-4 md:px-6">
      {/* Header */}
      <header className="mb-6 ml-8 md:ml-0 flex flex-col md:flex-row md:justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">Admin Request Managament</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage and monitor all assistance requests</p>
        </div>
      </header>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Disaster */}
            <div>
              <Label>Disaster</Label>
              <Select value={selectedDisaster} onValueChange={setSelectedDisaster}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {disasters.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Type */}
            <div>
              <Label>Type</Label>
              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
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
            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
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

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>
            {loading ? "Loading…" : error ?? `${filtered.length} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-slate-500">
                      No matching requests
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.type}</Badge>
                    </TableCell>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>{getStatusBadge(r.status)}</TableCell>
                    <TableCell>
                      {new Date(r.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog("details", r)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDialog("chat", r)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        {["open", "Assigned"].includes(r.status) && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDialog("edit", r)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500"
                              onClick={() => openDialog("cancel", r)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs (Details, Edit, Cancel, Chat) remain unchanged */}
      <Dialog
        open={dialogs.details}
        onOpenChange={() => closeDialog("details")}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  <p>
                    <strong>Title:</strong> {selectedRequest.title}
                  </p>
                  <p>
                    <strong>Description:</strong> {selectedRequest.description}
                  </p>
                  <p>
                    <strong>Type:</strong> {selectedRequest.type}
                  </p>
                  <p>
                    <strong>Priority:</strong>{" "}
                    {getPriorityBadge(selectedRequest.priority)}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {getStatusBadge(selectedRequest.status)}
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => closeDialog("details")}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogs.edit} onOpenChange={() => closeDialog("edit")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Request</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="mt-1 w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={editType}
                  onValueChange={(v) => setEditType(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div>
                <Label>Priority</Label>
                <Select
                  value={editPriority}
                  onValueChange={(v) => setEditPriority(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogDescription>
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => closeDialog("edit")}>
              Cancel
            </Button>
            <Button onClick={submitEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogs.cancel} onOpenChange={() => closeDialog("cancel")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this request?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => closeDialog("cancel")}>
              No
            </Button>
            <Button className="text-red-500" onClick={submitCancel}>
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogs.chat} onOpenChange={() => closeDialog("chat")}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Chat</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {selectedRequest && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4">
                  <p>
                    <strong>Title:</strong> {selectedRequest.title}
                  </p>
                  <p>
                    <strong>Description:</strong> {selectedRequest.description}
                  </p>
                  <p>
                    <strong>Type:</strong> {selectedRequest.type}
                  </p>
                  <p>
                    <strong>Priority:</strong>{" "}
                    {getPriorityBadge(selectedRequest.priority)}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {getStatusBadge(selectedRequest.status)}
                  </p>
                </TabsContent>
                <TabsContent value="chat">
                  <ChatInterface requestId={selectedRequest.id} />
                </TabsContent>
              </Tabs>
            )}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  )
}
