// pages/admin/task-allocations.tsx
"use client"

import React, { useState, useEffect, useCallback } from "react"
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
import { callApi } from "@/lib/api"

interface Disaster { id: string; name: string }
interface Coordinates { lat: number; lng: number }
interface ResourceReq { resource_type: string; quantity: number }
interface Task {
  name: string | null
  description: string
  urgency: string
  resource_requirements: ResourceReq[]
  manpower_requirement: number
}
interface Resource {
  donor_id: string
  donor_type: string
  resource_type: string
  location: Coordinates
  quantity: number
  status: string
}
interface ResourceAllocation { resource: Resource; accepted: string }
interface Volunteer {
  id: string
  location: Coordinates
  status: string
}
interface VolunteerAllocation { volunteer: Volunteer; accepted: string }
interface TaskAllocation {
  task: Task
  resource_allocations: ResourceAllocation[]
  volunteer_allocations: VolunteerAllocation[]
}
interface SuggestionResponse {
  previous_action: string
  next_action: string
  disaster: {
    disaster_id: string
    disaster_type: string
    disaster_coordinates: Coordinates
    disaster_location: string | null
    disaster_summary: string
  }
  tasks: Task[]
  task_allocations: TaskAllocation[]
}

export default function AdminTaskAllocationsPage() {
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [selectedDisaster, setSelectedDisaster] = useState<string>("")
  const [cache, setCache] = useState<Record<string, SuggestionResponse>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // UI state for tabs
  const [activeTab, setActiveTab] = useState<"tasks" | "allocations">("tasks")
  const [activeAllocTab, setActiveAllocTab] = useState<"resources" | "volunteers">(
    "resources"
  )

  // State to store fetched donor display names
  const [donorNames, setDonorNames] = useState<Record<string, string>>({})
  // State to store fetched volunteer display names
  const [volunteerNames, setVolunteerNames] = useState<Record<string, string>>({})

  // State to track assigned status for resources and volunteers
  const [assignedResources, setAssignedResources] = useState<Record<string, boolean>>({})
  const [assignedVolunteers, setAssignedVolunteers] = useState<Record<string, boolean>>({})

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("aiTaskAllocations")
      if (saved) setCache(JSON.parse(saved))
    } catch {
      // ignore
    }
  }, [])

  // Load disasters
  useEffect(() => {
    async function load() {
      try {
        const data = await callApi<Disaster[]>("disasters/", "GET")
        setDisasters(data)
        if (data.length) setSelectedDisaster(data[0].id)
      } catch {
        console.error("Failed to fetch disasters")
      }
    }
    load()
  }, [])

  useEffect(() => {
    setError(null)
  }, [selectedDisaster])

  const fetchSuggestions = useCallback(async () => {
    if (!selectedDisaster) return
    setLoading(true)
    setError(null)
    try {
      const res = await callApi<SuggestionResponse>(
        `resources/suggest/${selectedDisaster}`,
        "POST"
      )
      setCache((prev) => {
        const next = { ...prev, [selectedDisaster]: res }
        window.localStorage.setItem("aiTaskAllocations", JSON.stringify(next))
        return next
      })
      // Reset to show tasks first
      setActiveTab("tasks")
      setActiveAllocTab("resources")
      // Reset assigned state when new data loads
      setAssignedResources({})
      setAssignedVolunteers({})
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Failed to fetch allocations")
    } finally {
      setLoading(false)
    }
  }, [selectedDisaster])

  const current = cache[selectedDisaster]

  // Fetch display names for all donor and volunteer IDs when `current` updates
  useEffect(() => {
    if (!current) return

    // Collect unique donor IDs from resource_allocations
    const donorIds = Array.from(
      new Set(
        current.task_allocations.flatMap((ta) =>
          ta.resource_allocations.map((ra) => ra.resource.donor_id)
        )
      )
    )
    donorIds.forEach((id) => {
      if (!donorNames[id]) {
        callApi<{ display_name: string }>(`users/${id}/display_name`, "GET")
          .then((res) => {
            setDonorNames((prev) => ({ ...prev, [id]: res.display_name }))
          })
          .catch(() => {
            // If fetching fails, leave fallback as ID
          })
      }
    })

    // Collect unique volunteer IDs from volunteer_allocations
    const volunteerIds = Array.from(
      new Set(
        current.task_allocations.flatMap((ta) =>
          ta.volunteer_allocations.map((va) => va.volunteer.id)
        )
      )
    )
    volunteerIds.forEach((id) => {
      if (!volunteerNames[id]) {
        callApi<{ display_name: string }>(`users/${id}/display_name`, "GET")
          .then((res) => {
            setVolunteerNames((prev) => ({ ...prev, [id]: res.display_name }))
          })
          .catch(() => {
            // If fetching fails, leave fallback as ID
          })
      }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  return (
    <div className="fixed inset-0 py-6 md:left-64 md:right-0 overflow-auto px-6 md:px-8 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">
            AI-Driven Resource Allocation
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Generate and review resource & volunteer assignments per disaster
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            value={selectedDisaster}
            onValueChange={setSelectedDisaster}
          >
            <SelectTrigger className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 w-48">
              <SelectValue placeholder="Select disaster…" />
            </SelectTrigger>
            <SelectContent>
              {disasters.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white px-4 py-2 rounded-lg shadow-md transition"
            onClick={fetchSuggestions}
            disabled={!selectedDisaster || loading}
          >
            {loading ? "Allocating…" : "Reallocate Resources"}
          </Button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <p className="mb-6 text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
      )}

      {/* Prompt when no data */}
      {!current && !loading && !error && (
        <p className="text-gray-500 dark:text-gray-400">
          Select a disaster and click “Reallocate Resources” to fetch AI-recommended assignments.
        </p>
      )}

      {/* Main Content */}
      {current && (
        <>
          {/* Top summary section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Disaster Details Card */}
            <Card className="border-0 shadow-lg rounded-xl bg-white dark:bg-gray-800 col-span-2">
              <CardHeader className="bg-gray-100 dark:bg-gray-700 rounded-t-xl">
                <CardTitle className="text-gray-800 dark:text-gray-200">
                  Disaster Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CardDescription className="text-gray-700 dark:text-gray-300 mb-4">
                  {current.disaster.disaster_summary}
                </CardDescription>
                <div className="grid grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                  <div>
                    <span className="font-semibold">ID:</span>{" "}
                    {current.disaster.disaster_id}
                  </div>
                  <div>
                    <span className="font-semibold">Type:</span>{" "}
                    {current.disaster.disaster_type || "N/A"}
                  </div>
                  <div>
                    <span className="font-semibold">Coordinates:</span>{" "}
                    {current.disaster.disaster_coordinates.lat.toFixed(4)},{" "}
                    {current.disaster.disaster_coordinates.lng.toFixed(4)}
                  </div>
                  <div>
                    <span className="font-semibold">Location:</span>{" "}
                    {current.disaster.disaster_location || "Unknown"}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Quick Actions / Stats Card */}
            <Card className="border-0 shadow-lg rounded-xl bg-white dark:bg-gray-800">
              <CardHeader className="bg-gray-100 dark:bg-gray-700 rounded-t-xl">
                <CardTitle className="text-gray-800 dark:text-gray-200">
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span className="font-medium">Tasks:</span>
                    <span>{current.tasks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Resources Allocations:</span>
                    <span>
                      {current.task_allocations.reduce(
                        (sum, ta) => sum + ta.resource_allocations.length,
                        0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Volunteer Allocations:</span>
                    <span>
                      {current.task_allocations.reduce(
                        (sum, ta) => sum + ta.volunteer_allocations.length,
                        0
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Tasks vs Allocations */}
          <div className="mb-6">
            <nav className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                className={`px-4 py-2 -mb-px font-semibold ${
                  activeTab === "tasks"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 dark:text-gray-400 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab("tasks")}
              >
                Tasks Overview
              </button>
              <button
                className={`ml-4 px-4 py-2 -mb-px font-semibold ${
                  activeTab === "allocations"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 dark:text-gray-400 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab("allocations")}
              >
                Allocations
              </button>
            </nav>
          </div>

          {/* Tasks Overview Section */}
          {activeTab === "tasks" && (
            <Card className="mb-6 border-0 shadow-lg rounded-xl bg-white dark:bg-gray-800">
              <CardHeader className="bg-gray-100 dark:bg-gray-700 rounded-t-xl">
                <CardTitle className="text-gray-800 dark:text-gray-200">
                  Task Resource Needs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-5">
                  {current.tasks.map((t, i) => (
                    <li
                      key={i}
                      className="flex flex-col md:flex-row md:justify-between md:items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                    >
                      <div className="flex items-center mb-3 md:mb-0">
                        <span
                          className={`uppercase text-xs font-semibold px-2 py-1 rounded ${
                            t.urgency === "high"
                              ? "bg-red-200 text-red-800"
                              : t.urgency === "medium"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-green-200 text-green-800"
                          }`}
                        >
                          {t.urgency}
                        </span>
                        <span className="ml-3 text-gray-800 dark:text-gray-200 font-medium">
                          {t.description}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
                        <span>
                          <strong>Manpower:</strong> {t.manpower_requirement} people
                        </span>
                        <span>
                          <strong>Resources:</strong>{" "}
                          {t.resource_requirements
                            .map((r) => `${r.quantity}× ${r.resource_type}`)
                            .join(", ")}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Allocations Section */}
          {activeTab === "allocations" && (
            <Card className="mb-6 border-0 shadow-lg rounded-xl bg-white dark:bg-gray-800">
              <CardHeader className="bg-gray-100 dark:bg-gray-700 rounded-t-xl">
                <CardTitle className="text-gray-800 dark:text-gray-200">
                  AI-Recommended Allocations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Sub-tabs for Resources vs Volunteers */}
                <div className="mb-4">
                  <nav className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                      className={`px-4 py-2 -mb-px font-semibold ${
                        activeAllocTab === "resources"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600 dark:text-gray-400 hover:text-blue-600"
                      }`}
                      onClick={() => setActiveAllocTab("resources")}
                    >
                      Resources
                    </button>
                    <button
                      className={`ml-4 px-4 py-2 -mb-px font-semibold ${
                        activeAllocTab === "volunteers"
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600 dark:text-gray-400 hover:text-blue-600"
                      }`}
                      onClick={() => setActiveAllocTab("volunteers")}
                    >
                      Volunteers
                    </button>
                  </nav>
                </div>

                {/* Resource Allocations Table */}
                {activeAllocTab === "resources" && (
                  <>
                    {current.task_allocations.every(
                      (ta) => ta.resource_allocations.length === 0
                    ) ? (
                      <p className="text-gray-500 dark:text-gray-400">
                        No resource allocations proposed.
                      </p>
                    ) : (
                      <Table className="w-full table-auto text-gray-700 dark:text-gray-300">
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                          <TableRow className="font-semibold">
                            <TableHead>Resource Type</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Assigned Task</TableHead>
                            <TableHead>Donor</TableHead>
                            <TableHead>Donor Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Accepted</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {current.task_allocations.flatMap((ta, ti) =>
                            ta.resource_allocations.map((ra, ri) => {
                              const key = `res-${ti}-${ri}`
                              const isAssigned = assignedResources[key] === true
                              return (
                                <TableRow
                                  key={key}
                                  className="even:bg-gray-50 dark:even:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                  <TableCell className="py-3 px-2">
                                    {ra.resource.resource_type}
                                  </TableCell>
                                  <TableCell className="py-3 px-2">
                                    {ra.resource.quantity}
                                  </TableCell>
                                  <TableCell className="py-3 px-2 whitespace-normal">
                                    {ta.task.description}
                                  </TableCell>
                                  <TableCell className="py-3 px-2">
                                    {donorNames[ra.resource.donor_id] ||
                                      ra.resource.donor_id}
                                  </TableCell>
                                  <TableCell className="py-3 px-2">
                                    {ra.resource.donor_type}
                                  </TableCell>
                                  <TableCell className="py-3 px-2">
                                    {ra.resource.status}
                                  </TableCell>
                                  <TableCell className="py-3 px-2 flex items-center">
                                    <Badge
                                      variant={
                                        ra.accepted === "pending"
                                          ? "outline"
                                          : ra.accepted === "accepted"
                                          ? "default"
                                          : "destructive"
                                      }
                                    >
                                      {ra.accepted}
                                    </Badge>
                                    <Button
                                      size="sm"
                                      className={`ml-2 px-2 py-1 rounded ${
                                        isAssigned
                                          ? "bg-red-600 hover:bg-red-700 text-white"
                                          : "bg-green-600 hover:bg-green-700 text-white"
                                      }`}
                                      onClick={() => {
                                        if (!isAssigned) {
                                          const confirmed = window.confirm(
                                            "Are you sure?"
                                          )
                                          if (confirmed) {
                                            setAssignedResources((prev) => ({
                                              ...prev,
                                              [key]: true,
                                            }))
                                          }
                                        }
                                      }}
                                      disabled={isAssigned}
                                    >
                                      {isAssigned ? "Assigned" : "Authorize"}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </>
                )}

                {/* Volunteer Allocations Table */}
                {activeAllocTab === "volunteers" && (
                  <>
                    {current.task_allocations.every(
                      (ta) => ta.volunteer_allocations.length === 0
                    ) ? (
                      <p className="text-gray-500 dark:text-gray-400">
                        No volunteer allocations proposed.
                      </p>
                    ) : (
                      <Table className="w-full table-auto text-gray-700 dark:text-gray-300">
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                          <TableRow className="font-semibold">
                            <TableHead>Volunteer</TableHead>
                            <TableHead>Location (Lat, Lng)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assigned Task</TableHead>
                            <TableHead>Accepted</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {current.task_allocations.flatMap((ta, ti) =>
                            ta.volunteer_allocations.map((va, vi) => {
                              const key = `vol-${ti}-${vi}`
                              const isAssigned = assignedVolunteers[key] === true
                              return (
                                <TableRow
                                  key={key}
                                  className="even:bg-gray-50 dark:even:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                  <TableCell className="py-3 px-2">
                                    {volunteerNames[va.volunteer.id] ||
                                      va.volunteer.id}
                                  </TableCell>
                                  <TableCell className="py-3 px-2">
                                    {va.volunteer.location.lat.toFixed(4)},{" "}
                                    {va.volunteer.location.lng.toFixed(4)}
                                  </TableCell>
                                  <TableCell className="py-3 px-2">
                                    {va.volunteer.status}
                                  </TableCell>
                                  <TableCell className="py-3 px-2 whitespace-normal">
                                    {ta.task.description}
                                  </TableCell>
                                  <TableCell className="py-3 px-2 flex items-center">
                                    <Badge
                                      variant={
                                        va.accepted === "pending"
                                          ? "outline"
                                          : va.accepted === "accepted"
                                          ? "default"
                                          : "destructive"
                                      }
                                    >
                                      {va.accepted}
                                    </Badge>
                                    <Button
                                      size="sm"
                                      className={`ml-2 px-2 py-1 rounded ${
                                        isAssigned
                                          ? "bg-red-600 hover:bg-red-700 text-white"
                                          : "bg-green-600 hover:bg-green-700 text-white"
                                      }`}
                                      onClick={() => {
                                        if (!isAssigned) {
                                          const confirmed = window.confirm(
                                            "Are you sure?"
                                          )
                                          if (confirmed) {
                                            setAssignedVolunteers((prev) => ({
                                              ...prev,
                                              [key]: true,
                                            }))
                                          }
                                        }
                                      }}
                                      disabled={isAssigned}
                                    >
                                      {isAssigned ? "Assigned" : "Authorize"}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
