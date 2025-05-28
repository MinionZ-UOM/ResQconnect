"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { callApi } from "@/lib/api"
import type { Task, RequestPriority, GeoLocation, User } from "@/lib/types"

export default function VolunteerTasksPage() {
  const searchParams = useSearchParams()
  const disasterId = searchParams.get("disasterId")

  const [me, setMe] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [tasksError, setTasksError] = useState<string | null>(null)

  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | "All">("All")
  const [statusFilter, setStatusFilter] = useState<Task["status"] | "All">("All")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string>("")

  // Fetch current user and their tasks
  useEffect(() => {
    async function load() {
      setLoadingTasks(true)
      try {
        const user = await callApi<User>("users/me")
        setMe(user)

        const allTasks = await callApi<Task[]>("tasks")
        const mine = allTasks.filter(t => t.assigned_to === user.display_name)
        setTasks(mine)
      } catch (err: any) {
        setTasksError(err.message || "Failed to load tasks.")
      } finally {
        setLoadingTasks(false)
      }
    }
    load()
  }, [])

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setUserLocation({ latitude: coords.latitude, longitude: coords.longitude })
          setIsLoadingLocation(false)
        },
        () => {
          setLocationError("Unable to get your location. Some features may be limited.")
          setIsLoadingLocation(false)
        }
      )
    } else {
      setLocationError("Geolocation is not supported by your browser.")
    }
  }, [])

  // Filter and sort client-side
  const filtered = tasks.filter(task => {
    if (disasterId && task.disaster_id !== disasterId) return false
    const matchPri = priorityFilter === "All" || task.priority === priorityFilter
    const matchSta = statusFilter === "All" || task.status === statusFilter
    return matchPri && matchSta
  })

  const priorityOrder = { 1: 0, 2: 1, 3: 2, 4: 3 }
  const statusOrder = { pending: 0, on_route: 1, completed: 2, failed: 3 }

  const filteredAndSorted = [...filtered].sort((a, b) => {
    const pA = priorityOrder[a.priority] ?? 99
    const pB = priorityOrder[b.priority] ?? 99
    if (pA !== pB) return pA - pB
    const sA = statusOrder[a.status] ?? 99
    const sB = statusOrder[b.status] ?? 99
    return sA - sB
  })

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task)
    setIsDetailsOpen(true)
  }

  const handleUpdateStatus = async (task: Task, newStatus: Task["status"]) => {
    try {
      await callApi<Task>(`tasks/${task.id}/status`, "PATCH", { status: newStatus })
      if (me) {
        const all = await callApi<Task[]>("tasks")
        setTasks(all.filter(t => t.assigned_to === me.display_name))
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status")
    }
  }

  if (loadingTasks) return <p>Loading your tasks…</p>
  if (tasksError)   return <p className="text-red-500">{tasksError}</p>

  return (
    <div className="fixed inset-0 py-3 md:left-64 md:right-0 overflow-auto px-4 md:px-6">    
      <header className="mb-6 ml-8 md:ml-0">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
          {disasterId ? `Tasks for Disaster ${disasterId}` : "My Tasks"}
        </h1>
        <p>Manage and track your volunteer assignments</p>
      </header>

      {locationError && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-start gap-2">
            <AlertTriangle />
            <p>{locationError}</p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>Priority</label>
              <Select value={priorityFilter} onValueChange={v => setPriorityFilter(v as any)}>
                <SelectTrigger><SelectValue placeholder="All"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="1">Critical</SelectItem>
                  <SelectItem value="2">High</SelectItem>
                  <SelectItem value="3">Medium</SelectItem>
                  <SelectItem value="4">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label>Status</label>
              <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
                <SelectTrigger><SelectValue placeholder="All"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="on_route">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
          <CardDescription>{filteredAndSorted.length} tasks found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
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
                {filteredAndSorted.length > 0 ? (
                  filteredAndSorted.map(task => (
                    <TableRow key={task.id}>
                      <TableCell>{task.instructions}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>{getProgressBadge(task.status)}</TableCell>
                      <TableCell>{task.disaster_id}</TableCell>
                      <TableCell className="text-right flex items-center gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(task)}>
                          View
                        </Button>
                        <Select onValueChange={v => handleUpdateStatus(task, v as Task["status"])}>
                          <SelectTrigger className="h-9 w-[130px]"><SelectValue placeholder="Update"/></SelectTrigger>
                          <SelectContent>
                            {task.status !== "pending"   && <SelectItem value="pending">Pending</SelectItem>}
                            {task.status !== "on_route"  && <SelectItem value="on_route">In Progress</SelectItem>}
                            {task.status !== "completed" && <SelectItem value="completed">Completed</SelectItem>}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No tasks to display.
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
            <DialogDescription>Full information</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div>
              <p>{selectedTask.instructions}</p>
              <p>Priority: {selectedTask.priority}</p>
              <p>Status: {selectedTask.status}</p>
              <p>Disaster: {selectedTask.disaster_id}</p>
              <p>Created: {new Date(selectedTask.created_at).toLocaleString()}</p>
              <p>Updated: {new Date(selectedTask.updated_at).toLocaleString()}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper badges moved below to keep component concise
function getPriorityBadge(priority: number) {
  switch (priority) {
    case 1: return <Badge variant="destructive">Critical</Badge>
    case 2: return <Badge variant="default" className="bg-orange-500">High</Badge>
    case 3: return <Badge variant="default" className="bg-yellow-500">Medium</Badge>
    case 4: return <Badge variant="default" className="bg-green-500">Low</Badge>
    default: return <Badge variant="outline">Unknown</Badge>
  }
}

function getProgressBadge(status: string) {
  switch (status) {
    case "pending":   return <Badge variant="outline" className="border-blue-500 text-blue-500">Pending</Badge>
    case "on_route":  return <Badge variant="default" className="bg-yellow-500">In Progress</Badge>
    case "completed": return <Badge variant="default" className="bg-green-500">Completed</Badge>
    default:          return <Badge variant="outline">Unknown</Badge>
  }
}
