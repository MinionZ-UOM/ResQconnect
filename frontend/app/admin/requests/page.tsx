"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChatInterface } from "@/components/chat/chat-interface"
import {
  MapPin,
  AlertTriangle,
  Clock,
  Edit,
  Trash,
  Plus,
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

export default function AffectedRequestsPage() {
  // Filters
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [selectedDisaster, setSelectedDisaster] = useState<string>("All")
  const [typeFilter, setTypeFilter] = useState<RequestType | "All">("All")
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "All">(
    "All"
  )

  // Data
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog + form state
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
  const [cancelReason, setCancelReason] = useState("")

  // 1) fetch disasters
  useEffect(() => {
    async function loadDisasters() {
      try {
        const data = await callApi<Disaster[]>("disasters/", "GET")
        setDisasters(data)
      } catch {
        // fallback to just "All"
      }
    }
    loadDisasters()
  }, [])

  // 2) fetch requests (with disasterId)
  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const endpoint =
      selectedDisaster === "All"
        ? "requests/"
        : `requests/disaster/${selectedDisaster}`
    
      const data = await callApi<BackendRequest[]>(endpoint, "GET")
      setRequests(
        data.map((r) => ({
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
  }, [selectedDisaster])

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
      if (name === "cancel") setCancelReason("")
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

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Requests</h1>
          <p className="text-slate-600">Track and manage your assistance requests</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/affected/new-request${selectedDisaster !== "All" ? `?disasterId=${selectedDisaster}` : ""}`}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Link>
        </Button>
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
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Disasters</SelectItem>
                  {disasters.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Type */}
            <div>
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
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
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
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
          <CardTitle>Your Requests</CardTitle>
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
                  <TableHead>ID</TableHead>
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
                    <TableCell className="font-medium">{r.id}</TableCell>
                    <TableCell><Badge variant="outline">{r.type}</Badge></TableCell>
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
                        <Button size="sm" variant="outline" onClick={() => openDialog("details", r)}>
                          View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openDialog("chat", r)}>
                          <MessageSquare className="h-4 w-4"/>
                        </Button>
                        {["open", "Assigned"].includes(r.status) && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => openDialog("edit", r)}>
                              <Edit className="h-4 w-4"/>
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-500" onClick={() => openDialog("cancel", r)}>
                              <Trash className="h-4 w-4"/>
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

      {/* Details / Chat Dialog */}
      <Dialog
        open={dialogs.details || dialogs.chat}
        onOpenChange={() => {
          if (dialogs.details) closeDialog("details")
          else closeDialog("chat")
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {dialogs.chat ? "Communication" : "Request Details"}
            </DialogTitle>
            <DialogDescription>
              {dialogs.chat
                ? "Chat with a responder"
                : "Information about your request"}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <Tabs
              value={dialogs.chat ? "chat" : "details"}
              onValueChange={(v) => setActiveTab(v as any)}
            >
              <TabsList>
                <TabsTrigger onClick={() => openDialog("details", selectedRequest)} value="details">
                  Details
                </TabsTrigger>
                <TabsTrigger onClick={() => openDialog("chat", selectedRequest)} value="chat">
                  Communication
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                {/* …same as before… */}
              </TabsContent>

              <TabsContent value="chat">
                <div className="h-[500px]">
                  <ChatInterface
                    currentUserId={selectedRequest.created_by}
                    currentUserRole="Affected"
                    disasterId={selectedRequest.disaster_id}
                    requestId={selectedRequest.id}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={dialogs.edit} onOpenChange={() => closeDialog("edit")}>
        {/* …same as before… */}
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={dialogs.cancel} onOpenChange={() => closeDialog("cancel")}>
        {/* …same as before… */}
      </Dialog>
    </div>
  )
}
