"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { callApi } from "@/lib/api"
import type { Task, RequestPriority, Disaster } from "@/lib/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, Clock, MapPin, AlertTriangle } from "lucide-react"

export default function ResponderTasksPage() {
  const searchParams = useSearchParams()
  const urlDisasterId = searchParams.get("disasterId") || "All"

  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | "All">("All")
  const [statusFilter, setStatusFilter] = useState<"All" | "pending" | "on_route" | "completed" | "failed">("All")
  const [disasterFilter, setDisasterFilter] = useState<string | "All">(urlDisasterId)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // assign modal state
  const [assigningTask, setAssigningTask] = useState<Task | null>(null)
  const [volunteers, setVolunteers] = useState<string[]>([])
  const [selectedVolunteer, setSelectedVolunteer] = useState<string | undefined>(undefined)

  useEffect(() => {
    async function loadData() {
      const ds = await callApi<Disaster[]>("disasters", "GET")
      setDisasters([{ id: "All", name: "All Disasters" }, ...ds])
      const ts = await callApi<Task[]>("tasks/", "GET")
      setTasks(ts.filter((t) => t.is_authorized))
    }
    loadData()
  }, [])

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const payload = { status: newStatus }
    const updated = await callApi<Task>(`tasks/${taskId}/status`, "PATCH", payload)
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
  }

  const openDetails = (t: Task) => {
    setSelectedTask(t)
    setIsDetailsOpen(true)
  }

  const openAssign = async (t: Task) => {
    setAssigningTask(t)
    const vs = await callApi<string[]>(`disasters/${t.disaster_id}/volunteers`, "GET")
    console.log("Volunteers for disaster:", vs)
    setVolunteers(vs)
    setSelectedVolunteer(undefined)
  }

  const doAssign = async () => {
    if (!assigningTask || !selectedVolunteer) return
    const payload = { assigned_to: selectedVolunteer }
    const updated = await callApi<Task>(
      `tasks/${assigningTask.id}/assign`,
      "PATCH",
      payload
    )
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setAssigningTask(null)
  }

  const getPriorityBadge = (p: RequestPriority) => {
    switch (p) {
      case "Critical":
        return <Badge variant="destructive">Critical</Badge>
      case "High":
        return <Badge variant="default" className="bg-orange-500">High</Badge>
      case "Medium":
        return <Badge variant="default" className="bg-yellow-500">Medium</Badge>
      case "Low":
        return <Badge variant="default" className="bg-green-500">Low</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getProgressBadge = (s?: string) => {
    switch (s) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "on_route":
        return <Badge variant="default">On Route</Badge>
      case "completed":
        return <Badge variant="default">Completed</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getDisasterName = (id: string) => {
    const d = disasters.find((x) => x.id === id)
    return d ? d.name : "Unknown"
  }

  const filtered = tasks
    .filter((t) => disasterFilter === "All" || t.disaster_id === disasterFilter)
    .filter((t) => priorityFilter === "All" || t.priority === priorityFilter)
    .filter((t) => statusFilter === "All" || t.status === statusFilter)
    .sort((a, b) => {
      const po = { Critical: 0, High: 1, Medium: 2, Low: 3 }
      const so = { pending: 0, on_route: 1, completed: 2, failed: 3 }
      const pd = po[a.priority as keyof typeof po] - po[b.priority as keyof typeof po]
      if (pd !== 0) return pd
      return so[a.status as keyof typeof so] - so[b.status as keyof typeof so]
    })

  return (
    <div className="fixed top-0 bottom-0 left-64 right-0 overflow-auto px-4 md:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">
          {disasterFilter === "All"
            ? "My Tasks"
            : `Tasks for ${getDisasterName(disasterFilter)}`}
        </h1>
      </header>

      <Card className="mb-6">
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-medium mb-1 block">Disaster</label>
              <Select value={disasterFilter} onValueChange={(v) => setDisasterFilter(v)}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  {disasters.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-medium mb-1 block">Priority</label>
              <Select
                value={priorityFilter}
                onValueChange={(v) => setPriorityFilter(v as any)}
              >
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="font-medium mb-1 block">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as any)}
              >
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="on_route">On Route</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>{filtered.length} found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Disaster</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.instructions || t.id}</TableCell>
                    <TableCell>{getPriorityBadge(t.priority)}</TableCell>
                    <TableCell>{getProgressBadge(t.status)}</TableCell>
                    <TableCell>{getDisasterName(t.disaster_id)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openDetails(t)}>
                        View
                      </Button>
                      {!t.assigned_to && (
                        <Button size="sm" onClick={() => openAssign(t)}>
                          Assign
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={() => setIsDetailsOpen(false)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>Detailed information about the task</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{selectedTask.instructions || selectedTask.id}</h2>
                <div className="flex gap-2">
                  {getPriorityBadge(selectedTask.priority)}
                  {getProgressBadge(selectedTask.status)}
                </div>
              </div>
              {selectedTask.description && <p>{selectedTask.description}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Location</h3>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedTask.location?.address}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Created</h3>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(selectedTask.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Updated</h3>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(selectedTask.updated_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={!!assigningTask} onOpenChange={() => setAssigningTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <DialogDescription>
              Select a volunteer for “{assigningTask?.instructions || assigningTask?.id}”
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedVolunteer} onValueChange={(v) => setSelectedVolunteer(v)}>
            <SelectTrigger><SelectValue placeholder="Choose volunteer" /></SelectTrigger>
            <SelectContent>
              {volunteers.map((uid) => (
                <SelectItem key={uid} value={uid}>
                  {uid}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-4 flex justify-end">
            <Button disabled={!selectedVolunteer} onClick={doAssign}>
              Assign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
