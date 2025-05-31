// pages/admin/task-allocations.tsx
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

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("aiTaskAllocations")
      if (saved) setCache(JSON.parse(saved))
    } catch {}
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
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Failed to fetch allocations")
    } finally {
      setLoading(false)
    }
  }, [selectedDisaster])

  const current = cache[selectedDisaster]

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
        <Button
          className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white px-4 py-2 rounded-lg shadow-md transition"
          onClick={fetchSuggestions}
          disabled={!selectedDisaster || loading}
        >
          {loading ? "Allocating…" : "Reallocate Resources"}
        </Button>
      </header>

      {/* Disaster selector */}
      <Card className="mb-6 border-0 shadow-lg rounded-xl bg-white dark:bg-gray-800">
        <CardHeader className="bg-gray-100 dark:bg-gray-700 rounded-t-xl">
          <CardTitle className="text-gray-800 dark:text-gray-200">
            Select Disaster
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Select
            value={selectedDisaster}
            onValueChange={setSelectedDisaster}
          >
            <SelectTrigger className="w-full max-w-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Choose a disaster…" />
            </SelectTrigger>
            <SelectContent>
              {disasters.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <p className="mb-6 text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
      )}

      {/* Prompt when no data */}
      {!current && !loading && !error && (
        <p className="text-gray-500 dark:text-gray-400">
          Click “Reallocate Resources” to fetch AI-recommended assignments.
        </p>
      )}

      {/* All fetched data */}
      {current && (
        <>
          {/* Disaster summary & metadata */}
          <Card className="mb-6 border-0 shadow-lg rounded-xl bg-white dark:bg-gray-800">
            <CardHeader className="bg-gray-100 dark:bg-gray-700 rounded-t-xl">
              <CardTitle className="text-gray-800 dark:text-gray-200">
                Disaster Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <CardDescription className="text-gray-700 dark:text-gray-300">
                {current.disaster.disaster_summary}
              </CardDescription>
              <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center">
                  <span className="font-semibold w-24">ID:</span>
                  <span>{current.disaster.disaster_id}</span>
                </li>
                <li className="flex items-center">
                  <span className="font-semibold w-24">Type:</span>
                  <span>{current.disaster.disaster_type || "N/A"}</span>
                </li>
                <li className="flex items-center">
                  <span className="font-semibold w-24">Coordinates:</span>
                  <span>
                    {current.disaster.disaster_coordinates.lat.toFixed(4)},{" "}
                    {current.disaster.disaster_coordinates.lng.toFixed(4)}
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="font-semibold w-24">Location:</span>
                  <span>{current.disaster.disaster_location || "Unknown"}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Task requirements */}
          <Card className="mb-6 border-0 shadow-lg rounded-xl bg-white dark:bg-gray-800">
            <CardHeader className="bg-gray-100 dark:bg-gray-700 rounded-t-xl">
              <CardTitle className="text-gray-800 dark:text-gray-200">
                Task Resource Needs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300">
                {current.tasks.map((t, i) => (
                  <li key={i} className="flex flex-col gap-1">
                    <div>
                      <span className="uppercase text-xs font-semibold text-gray-600 dark:text-gray-400 mr-2">
                        [{t.urgency}]
                      </span>
                      <span>{t.description}</span>
                    </div>
                    <div className="ml-6 text-sm">
                      <span className="font-medium">
                        {t.manpower_requirement} people
                      </span>
                      <span className="ml-4 italic">
                        Resources:{" "}
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

          {/* Resource allocations */}
          <Card className="mb-6 border-0 shadow-lg rounded-xl bg-white dark:bg-gray-800">
            <CardHeader className="bg-gray-100 dark:bg-gray-700 rounded-t-xl">
              <CardTitle className="text-gray-800 dark:text-gray-200">
                AI-Recommended Resource Allocations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {current.task_allocations.length === 0 ? (
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
                      <TableHead>Donor ID</TableHead>
                      <TableHead>Donor Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Accepted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {current.task_allocations.flatMap((ta, ti) =>
                      ta.resource_allocations.map((ra, ri) => (
                        <TableRow
                          key={`res-${ti}-${ri}`}
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
                            {ra.resource.donor_id}
                          </TableCell>
                          <TableCell className="py-3 px-2">
                            {ra.resource.donor_type}
                          </TableCell>
                          <TableCell className="py-3 px-2">
                            {ra.resource.status}
                          </TableCell>
                          <TableCell className="py-3 px-2">
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
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Volunteer allocations */}
          <Card className="border-0 shadow-lg rounded-xl bg-white dark:bg-gray-800">
            <CardHeader className="bg-gray-100 dark:bg-gray-700 rounded-t-xl">
              <CardTitle className="text-gray-800 dark:text-gray-200">
                AI-Recommended Volunteer Allocations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
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
                      <TableHead>Volunteer ID</TableHead>
                      <TableHead>Location (Lat, Lng)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Task</TableHead>
                      <TableHead>Accepted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {current.task_allocations.flatMap((ta, ti) =>
                      ta.volunteer_allocations.map((va, vi) => (
                        <TableRow
                          key={`vol-${ti}-${vi}`}
                          className="even:bg-gray-50 dark:even:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          <TableCell className="py-3 px-2">
                            {va.volunteer.id}
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
                          <TableCell className="py-3 px-2">
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
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
