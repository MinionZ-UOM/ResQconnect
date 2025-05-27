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

  useEffect(() => {
    async function loadData() {
      try {
        const ds = await callApi<Disaster[]>("disasters", "GET")
        setDisasters([{ id: "All", name: "All Disasters" }, ...ds])

        // fetch only your tasks; then we'll keep only authorized
        const ts = await callApi<Task[]>("tasks", "GET")
        setTasks(ts.filter((t) => t.is_authorized))
      } catch (err) {
        console.error("Failed to load:", err)
      }
    }
    loadData()
  }, [])

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const payload = { status: newStatus }
      const updated = await callApi<Task>(`tasks/${taskId}/status`, "PATCH", payload)
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updated : t))
      )
    } catch (err) {
      console.error(err)
      alert("Failed to update status")
    }
  }

  const renderPriorityBadge = (p: RequestPriority) => {
    switch (p) {
      case 1: return <Badge variant="destructive">High</Badge>
      case 2: return <Badge variant="default">Medium</Badge>
      case 3: return <Badge variant="default">Low</Badge>
      default: return <Badge variant="outline">Unknown</Badge>
    }
  }
  const renderStatusBadge = (s: string) => {
    switch (s) {
      case "pending":  return <Badge variant="outline">Pending</Badge>
      case "on_route": return <Badge variant="default">On Route</Badge>
      case "completed":return <Badge variant="default">Completed</Badge>
      case "failed":   return <Badge variant="destructive">Failed</Badge>
      default:         return <Badge variant="outline">Unknown</Badge>
    }
  }

  const filtered = tasks
    .filter((t) => disasterFilter === "All" || t.disaster_id === disasterFilter)
    .filter((t) => priorityFilter === "All" || t.priority === priorityFilter)
    .filter((t) => statusFilter === "All" || t.status === statusFilter)
    .sort((a, b) => a.priority - b.priority)

  const openDetails = (t: Task) => {
    setSelectedTask(t)
    setIsDetailsOpen(true)
  }

  return (
    <div className="fixed top-0 bottom-0 left-64 right-0 overflow-auto px-4 md:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">
          {disasterFilter === "All"
            ? "Authorized Tasks"
            : `Tasks for ${disasters.find((d) => d.id === disasterFilter)?.name}`}
        </h1>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-medium">Disaster</label>
              <Select
                value={disasterFilter}
                onValueChange={(v) => setDisasterFilter(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {disasters.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Priority</label>
              <Select
                value={priorityFilter}
                onValueChange={(v) => setPriorityFilter(v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value={1}>High</SelectItem>
                  <SelectItem value={2}>Medium</SelectItem>
                  <SelectItem value={3}>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
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
          <CardTitle>Tasks</CardTitle>
          <CardDescription>{filtered.length} found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.instructions || t.id}</TableCell>
                      <TableCell>{renderPriorityBadge(t.priority)}</TableCell>
                      <TableCell>{renderStatusBadge(t.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{t.location?.address}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetails(t)}
                        >
                          View
                        </Button>
                        {t.status !== "completed" && (
                          <Select
                            onValueChange={(v) => updateTaskStatus(t.id, v)}
                          >
                            <SelectTrigger className="h-8 w-32">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="on_route">On Route</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No tasks match filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>Details about this task</DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {selectedTask.instructions || selectedTask.id}
                </h2>
                <div className="flex gap-2">
                  {renderPriorityBadge(selectedTask.priority)}
                  {renderStatusBadge(selectedTask.status)}
                </div>
              </div>

              {selectedTask.description && (
                <p className="text-slate-600">{selectedTask.description}</p>
              )}

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

              {selectedTask.eta_minutes != null && (
                <div>
                  <h3 className="font-medium">ETA (min)</h3>
                  <p>{selectedTask.eta_minutes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                {selectedTask.status !== "completed" && (
                  <Button
                    onClick={() =>
                      updateTaskStatus(selectedTask.id, "completed")
                    }
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
