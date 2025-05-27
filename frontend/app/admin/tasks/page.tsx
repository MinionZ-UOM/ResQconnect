"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { callApi } from "@/lib/api"
import type { Task, Disaster } from "@/lib/types"
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

export default function AdminTasksPage() {
  const searchParams = useSearchParams()
  const urlDisasterId = searchParams.get("disasterId") || "All"

  // Admin page: user is admin
  const isAdmin = true

  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [priorityFilter, setPriorityFilter] = useState<number | "All">("All")
  const [statusFilter, setStatusFilter] = useState<string | "All">("All")
  const [disasterFilter, setDisasterFilter] = useState<string | "All">(urlDisasterId)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const ds = await callApi<Disaster[]>("disasters", "GET")
        setDisasters([{ id: "All", name: "All Disasters" }, ...ds])
        const ts = await callApi<Task[]>("tasks", "GET")
        setTasks(ts)
      } catch (err) {
        console.error(err)
      }
    }
    loadData()
  }, [])

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const payload = { status: newStatus }
      const updated = await callApi<Task>(`tasks/${taskId}/status`, "PATCH", payload)
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
    } catch (err) {
      console.error(err)
      alert("Failed to update status")
    }
  }

  const authorizeTask = async (taskId: string) => {
    try {
      const updated = await callApi<Task>(`tasks/${taskId}/authorize`, "PATCH")
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
      alert("Task authorized")
    } catch (err) {
      console.error(err)
      alert("Authorization failed")
    }
  }

  const renderBadge = (value: any, type: "priority" | "status") => {
    if (type === "priority") {
      const labels = { 1: "High", 2: "Medium", 3: "Low" }
      const variants = { 1: "destructive", 2: "default", 3: "default" } as const
      return <Badge variant={variants[value]}>{labels[value]}</Badge>
    }
    const variants = {
      pending: "outline",
      on_route: "default",
      completed: "default",
      failed: "destructive",
    } as const
    return <Badge variant={variants[value]}>{value.replace("_", " ")}</Badge>
  }

  const filtered = tasks
    .filter((t) => priorityFilter === "All" || t.priority === priorityFilter)
    .filter((t) => statusFilter === "All" || t.status === statusFilter)
    .filter((t) => disasterFilter === "All" || t.disaster_id === disasterFilter)
    .sort((a, b) => a.priority - b.priority)

  const openDetails = (task: Task) => {
    setSelectedTask(task)
    setIsDetailsOpen(true)
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">
          {disasterFilter === "All"
            ? "All Tasks"
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
                  <SelectItem value="1">High</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v)}
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
                  <TableHead>Instructions</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Disaster</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.instructions}</TableCell>
                      <TableCell>{renderBadge(t.priority, "priority")}</TableCell>
                      <TableCell>{renderBadge(t.status, "status")}</TableCell>
                      <TableCell>
                        {disasters.find((d) => d.id === t.disaster_id)?.name}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openDetails(t)}>
                          Details
                        </Button>
                        <Select onValueChange={(v) => updateTaskStatus(t.id, v)}>
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="on_route">On Route</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
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
            <DialogDescription>Admin view of task</DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{selectedTask.instructions}</h2>
                <div className="flex gap-2">
                  {renderBadge(selectedTask.priority, "priority")}
                  {renderBadge(selectedTask.status, "status")}
                </div>
              </div>

              {selectedTask.description && <p>{selectedTask.description}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Disaster</h3>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      {disasters.find((d) => d.id === selectedTask.disaster_id)?.name}
                    </span>
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

              {isAdmin && !selectedTask.is_authorized && (
                <div className="flex justify-end">
                  <Button variant="destructive" onClick={() => authorizeTask(selectedTask.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Authorize Task
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
