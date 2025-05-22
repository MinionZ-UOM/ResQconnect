"use client"

import { useState } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Task, RequestPriority } from "@/lib/types"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface TasksOverviewProps {
  disasterId?: string
}

export function TasksOverview({ disasterId }: TasksOverviewProps) {
  const [view, setView] = useState<"chart" | "table">("chart")
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("day")

  // Mock tasks data - in a real app, this would come from an API
  const mockTasks: Task[] = [
    {
      id: "task-001",
      disasterId: "disaster-001",
      title: "Medical team deployment",
      description: "Deploy medical team to community center",
      status: "InProgress",
      priority: "High",
      assignedTo: "user-101",
      progress: "InProgress",
      location: { latitude: 38.5816, longitude: -121.4944, address: "Community Center, Sacramento, CA" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "task-002",
      disasterId: "disaster-001",
      title: "Evacuation assistance",
      description: "Help evacuate elderly residents from Oak Street",
      status: "Assigned",
      priority: "Critical",
      assignedTo: "user-102",
      progress: "Assigned",
      location: { latitude: 38.5816, longitude: -121.4944, address: "Oak Street, Sacramento, CA" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
    },
    {
      id: "task-003",
      disasterId: "disaster-002",
      title: "Food distribution",
      description: "Distribute food supplies to shelter",
      status: "Completed",
      priority: "Medium",
      assignedTo: "user-103",
      progress: "Completed",
      location: { latitude: 29.7604, longitude: -95.3698, address: "Main Shelter, Houston, TX" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: "task-004",
      disasterId: "disaster-002",
      title: "Infrastructure assessment",
      description: "Assess damage to bridges and roads",
      status: "InProgress",
      priority: "High",
      assignedTo: "user-104",
      progress: "InProgress",
      location: { latitude: 29.7604, longitude: -95.3698, address: "Downtown, Houston, TX" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      updatedAt: new Date(Date.now() - 1000 * 60 * 45),
    },
    {
      id: "task-005",
      disasterId: "disaster-003",
      title: "Sandbag deployment",
      description: "Deploy sandbags along riverfront",
      status: "InProgress",
      priority: "High",
      assignedTo: "user-105",
      progress: "InProgress",
      location: { latitude: 38.627, longitude: -90.1994, address: "Riverfront, St. Louis, MO" },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60),
    },
  ]

  // Filter tasks by disaster if disasterId is provided
  const filteredTasks = disasterId ? mockTasks.filter((task) => task.disasterId === disasterId) : mockTasks

  // Prepare data for chart
  const statusCounts = {
    New: 0,
    Assigned: 0,
    InProgress: 0,
    Completed: 0,
    Cancelled: 0,
  }

  filteredTasks.forEach((task) => {
    statusCounts[task.status]++
  })

  const chartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: "Tasks",
        data: Object.values(statusCounts),
        backgroundColor: [
          "rgba(239, 68, 68, 0.6)",
          "rgba(59, 130, 246, 0.6)",
          "rgba(245, 158, 11, 0.6)",
          "rgba(16, 185, 129, 0.6)",
          "rgba(107, 114, 128, 0.6)",
        ],
        borderColor: [
          "rgba(239, 68, 68, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(107, 114, 128, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
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

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex space-x-1 rounded-md bg-slate-100 dark:bg-slate-800 p-1">
          <button
            onClick={() => setView("chart")}
            className={`px-3 py-1.5 text-sm rounded-md ${
              view === "chart" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Chart
          </button>
          <button
            onClick={() => setView("table")}
            className={`px-3 py-1.5 text-sm rounded-md ${
              view === "table" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Table
          </button>
        </div>

        {view === "chart" && (
          <div className="flex space-x-1 rounded-md bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setTimeframe("day")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                timeframe === "day" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setTimeframe("week")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                timeframe === "week" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe("month")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                timeframe === "month" ? "bg-white dark:bg-slate-700 shadow-sm" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Month
            </button>
          </div>
        )}
      </div>

      {view === "chart" ? (
        <div className="h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.assignedTo || "Unassigned"}</TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        task.status === "New" ? "destructive" : task.status === "Completed" ? "default" : "outline"
                      }
                      className={
                        task.status === "Completed"
                          ? "bg-green-500"
                          : task.status === "InProgress"
                            ? "bg-yellow-500"
                            : task.status === "Assigned"
                              ? "bg-blue-500"
                              : undefined
                      }
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.progress || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(task.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
