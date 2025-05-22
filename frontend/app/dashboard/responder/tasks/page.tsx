"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Clock, MapPin, AlertTriangle } from "lucide-react"
import type { Task, RequestPriority, Disaster } from "@/lib/types"

export default function ResponderTasksPage() {
  const searchParams = useSearchParams()
  const disasterId = searchParams.get("disasterId")

  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | "All">("All")
  const [statusFilter, setStatusFilter] = useState<"All" | "Assigned" | "Arrived" | "InProgress" | "Completed">("All")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

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

  // Mock tasks - in a real app, this would come from an API
  const mockTasks: Task[] = [
    {
      id: "task-001",
      disasterId: "disaster-001",
      title: "Medical team deployment",
      description: "Deploy medical team to community center for triage and treatment of minor injuries",
      status: "InProgress",
      priority: "High",
      assignedTo: "user-101", // Current user
      progress: "InProgress",
      steps: [
        "Arrive at community center",
        "Set up medical station",
        "Triage patients",
        "Provide treatment",
        "Report status",
      ],
      location: { latitude: 38.5816, longitude: -121.4944, address: "Community Center, 123 Main St, Sacramento, CA" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "task-002",
      disasterId: "disaster-001",
      title: "Evacuation assistance",
      description: "Help evacuate elderly residents from Oak Street retirement home to designated shelter",
      status: "Assigned",
      priority: "Critical",
      assignedTo: "user-101", // Current user
      progress: "Assigned",
      steps: [
        "Arrive at Oak Street retirement home",
        "Coordinate with staff",
        "Assist residents to evacuation vehicles",
        "Transport to shelter",
        "Confirm all residents accounted for",
      ],
      location: { latitude: 38.5816, longitude: -121.4944, address: "Oak Street Retirement Home, Sacramento, CA" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
    },
    {
      id: "task-003",
      disasterId: "disaster-002",
      title: "Rescue stranded family",
      description: "Family of 4 stranded on roof due to flooding. Boat rescue required.",
      status: "Assigned",
      priority: "Critical",
      assignedTo: "user-101", // Current user
      progress: "Assigned",
      steps: [
        "Deploy rescue boat",
        "Navigate to location",
        "Secure family members",
        "Transport to safety",
        "Provide immediate care if needed",
      ],
      location: { latitude: 29.7604, longitude: -95.3698, address: "42 River Road, Houston, TX" },
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: "task-004",
      disasterId: "disaster-001",
      title: "Supply delivery",
      description: "Deliver emergency supplies to shelter at Lincoln High School",
      status: "Completed",
      priority: "Medium",
      assignedTo: "user-101", // Current user
      progress: "Completed",
      steps: [
        "Load supplies",
        "Transport to shelter",
        "Unload and inventory",
        "Get confirmation signature",
        "Return to base",
      ],
      location: { latitude: 38.5816, longitude: -121.4944, address: "Lincoln High School, Sacramento, CA" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
  ]

  // Filter tasks based on disasterId if provided
  const filteredTasks = disasterId ? mockTasks.filter((task) => task.disasterId === disasterId) : mockTasks

  // Apply additional filters
  const filteredAndSortedTasks = filteredTasks
    .filter((task) => {
      const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter
      const matchesStatus = statusFilter === "All" || task.progress === statusFilter
      return matchesPriority && matchesStatus
    })
    .sort((a, b) => {
      // Sort by priority (Critical > High > Medium > Low)
      const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
      const priorityDiff =
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder]

      if (priorityDiff !== 0) return priorityDiff

      // Then sort by status (Assigned > Arrived > InProgress > Completed)
      const statusOrder = { Assigned: 0, Arrived: 1, InProgress: 2, Completed: 3 }
      const aStatus = a.progress || "Assigned"
      const bStatus = b.progress || "Assigned"
      return statusOrder[aStatus as keyof typeof statusOrder] - statusOrder[bStatus as keyof typeof statusOrder]
    })

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task)
    setIsDetailsOpen(true)
  }

  const handleUpdateProgress = (task: Task, newProgress: "Arrived" | "InProgress" | "Completed") => {
    // In a real app, this would be an API call to update the task
    console.log(`Updating task ${task.id} progress to ${newProgress}`)

    // Mock update
    alert(`Task progress updated to: ${newProgress}`)
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

  const getProgressBadge = (progress?: string) => {
    switch (progress) {
      case "Assigned":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Assigned
          </Badge>
        )
      case "Arrived":
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-500">
            Arrived
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
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
          {disasterId ? `Tasks for ${getDisasterName(disasterId)}` : "All Tasks"}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Manage and track your assigned tasks</p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Task Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Priority</label>
              <Select
                value={priorityFilter}
                onValueChange={(value) => setPriorityFilter(value as RequestPriority | "All")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Priorities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as "All" | "Assigned" | "Arrived" | "InProgress" | "Completed")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="Arrived">Arrived</SelectItem>
                  <SelectItem value="InProgress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>{filteredAndSortedTasks.length} tasks found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Disaster</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTasks.length > 0 ? (
                  filteredAndSortedTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>{getProgressBadge(task.progress)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">{task.location.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getDisasterName(task.disasterId)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(task)}>
                            View Details
                          </Button>
                          {task.progress !== "Completed" && (
                            <Select
                              onValueChange={(value) =>
                                handleUpdateProgress(task, value as "Arrived" | "InProgress" | "Completed")
                              }
                            >
                              <SelectTrigger className="h-9 w-[130px]">
                                <SelectValue placeholder="Update Status" />
                              </SelectTrigger>
                              <SelectContent>
                                {task.progress !== "Arrived" &&
                                  task.progress !== "InProgress" &&
                                  task.progress !== "Completed" && (
                                    <SelectItem value="Arrived">Mark as Arrived</SelectItem>
                                  )}
                                {(task.progress === "Arrived" || task.progress === "Assigned") && (
                                  <SelectItem value="InProgress">Start Work</SelectItem>
                                )}
                                {task.progress !== "Completed" && (
                                  <SelectItem value="Completed">Mark Complete</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-slate-500">
                      No tasks found matching the current filters.
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
            <DialogDescription>Detailed information about the task</DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{selectedTask.title}</h2>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(selectedTask.priority)}
                  {getProgressBadge(selectedTask.progress)}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
                <p className="text-slate-600 dark:text-slate-400">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Location</h3>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedTask.location.address}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Disaster</h3>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{getDisasterName(selectedTask.disasterId)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Assigned</h3>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(selectedTask.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Last Updated</h3>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(selectedTask.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedTask.steps && selectedTask.steps.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Task Steps</h3>
                  <ol className="list-decimal pl-5 space-y-1">
                    {selectedTask.steps.map((step, index) => (
                      <li key={index} className="text-slate-600 dark:text-slate-400">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                {selectedTask.progress !== "Completed" && (
                  <>
                    {selectedTask.progress !== "Arrived" && selectedTask.progress !== "InProgress" && (
                      <Button onClick={() => handleUpdateProgress(selectedTask, "Arrived")}>Mark as Arrived</Button>
                    )}
                    {(selectedTask.progress === "Arrived" || selectedTask.progress === "Assigned") && (
                      <Button onClick={() => handleUpdateProgress(selectedTask, "InProgress")}>Start Work</Button>
                    )}
                    {selectedTask.progress !== "Completed" && (
                      <Button onClick={() => handleUpdateProgress(selectedTask, "Completed")}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Complete
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
