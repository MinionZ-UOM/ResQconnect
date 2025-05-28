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
interface TaskAllocation {
  task: Task
  resource_allocations: ResourceAllocation[]
  volunteer_allocations: any[]
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
    <div className="fixed inset-0 py-4 md:left-64 md:right-0 overflow-auto px-6 md:px-8 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-300">
            AI-Driven Resource Allocation
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate and review resource assignments per disaster
          </p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={fetchSuggestions}
          disabled={!selectedDisaster || loading}
        >
          {loading ? "Allocating…" : "Reallocate Resources"}
        </Button>
      </header>

      {/* Disaster selector */}
      <Card className="mb-6 border-indigo-200 dark:border-indigo-700">
        <CardHeader className="bg-indigo-50 dark:bg-indigo-900">
          <CardTitle className="text-indigo-800 dark:text-indigo-200">
            Select Disaster
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedDisaster}
            onValueChange={setSelectedDisaster}
          >
            <SelectTrigger className="w-72 border-indigo-300 dark:border-indigo-600">
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

      {/* Prompt */}
      {!current && !loading && !error && (
        <p className="text-gray-500 dark:text-gray-400">
          Click “Reallocate Resources” to fetch AI-recommended assignments.
        </p>
      )}

      {/* Disaster summary */}
      {current && (
        <>
          <Card className="mb-6 border-green-200 dark:border-green-700">
            <CardHeader className="bg-green-50 dark:bg-green-900">
              <CardTitle className="text-green-800 dark:text-green-200">
                Disaster Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-700 dark:text-gray-300">
                {current.disaster.disaster_summary}
              </CardDescription>
            </CardContent>
          </Card>

          {/* Task requirements */}
          <Card className="mb-6 border-yellow-200 dark:border-yellow-700">
            <CardHeader className="bg-yellow-50 dark:bg-yellow-900">
              <CardTitle className="text-yellow-800 dark:text-yellow-200">
                Task Resource Needs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                {current.tasks.map((t, i) => (
                  <li key={i}>
                    <strong className="uppercase text-sm text-yellow-600 dark:text-yellow-300">
                      [{t.urgency}]
                    </strong>{" "}
                    {t.description} — Needs{" "}
                    <span className="font-medium">{t.manpower_requirement}</span>{" "}
                    people; Resources:{" "}
                    <span className="italic">
                      {t.resource_requirements
                        .map((r) => `${r.quantity}× ${r.resource_type}`)
                        .join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Resource allocations */}
          <Card className="border-purple-200 dark:border-purple-700">
            <CardHeader className="bg-purple-50 dark:bg-purple-900">
              <CardTitle className="text-purple-800 dark:text-purple-200">
                AI-Recommended Resource Allocations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {current.task_allocations.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  No resource allocations proposed.
                </p>
              ) : (
                <Table className="text-gray-700 dark:text-gray-300">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Assigned Task</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {current.task_allocations.flatMap((ta, ti) =>
                      ta.resource_allocations.map((ra, ri) => (
                        <TableRow
                          key={`${ti}-${ri}`}
                          className="hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <TableCell>
                            {ra.resource.resource_type}
                          </TableCell>
                          <TableCell>
                            {ra.resource.quantity}
                          </TableCell>
                          <TableCell className="whitespace-normal">
                            {ta.task.description}
                          </TableCell>
                          <TableCell>{ra.resource.donor_id}</TableCell>
                          <TableCell>
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
        </>
      )}
    </div>
  )
}
