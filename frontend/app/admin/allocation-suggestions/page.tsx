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

interface Disaster {
  id: string
  name: string
}

interface Coordinates {
  lat: number
  lng: number
}

interface ResourceReq {
  resource_type: string
  quantity: number
}

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

interface ResourceAllocation {
  resource: Resource
  accepted: string
}

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
  // Disasters list
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [selectedDisaster, setSelectedDisaster] = useState<string>("")

  // Suggestions cache (persisted to localStorage)
  const [cache, setCache] = useState<Record<string, SuggestionResponse>>({})

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hydrate cache from localStorage on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("aiTaskAllocations")
      if (saved) {
        setCache(JSON.parse(saved))
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Load disasters on mount
  useEffect(() => {
    async function loadDisasters() {
      try {
        const data = await callApi<Disaster[]>("disasters/", "GET")
        setDisasters(data)
        if (data.length > 0) {
          setSelectedDisaster(data[0].id)
        }
      } catch {
        console.error("Failed to fetch disasters")
      }
    }
    loadDisasters()
  }, [])

  // Clear error when disaster selection changes
  useEffect(() => {
    setError(null)
  }, [selectedDisaster])

  // Fetch AI suggestions for the selected disaster
  const fetchSuggestions = useCallback(async () => {
    if (!selectedDisaster) return
    setLoading(true)
    setError(null)

    try {
      const response = await callApi<SuggestionResponse>(
        `resources/suggest/${selectedDisaster}`,
        "POST"
      )

      // Update in-memory cache and persist to localStorage
      setCache((prev) => {
        const next = {
          ...prev,
          [selectedDisaster]: response,
        }
        window.localStorage.setItem(
          "aiTaskAllocations",
          JSON.stringify(next)
        )
        return next
      })
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Failed to fetch AI suggestions")
    } finally {
      setLoading(false)
    }
  }, [selectedDisaster])

  // Current suggestions for the selected disaster
  const current = cache[selectedDisaster]

  return (
    <div className="fixed inset-0 py-3 md:left-64 md:right-0 overflow-auto px-4 md:px-6">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI-Driven Task Allocations</h1>
          <p className="text-sm text-gray-600">
            Generate and review resource allocations per disaster
          </p>
        </div>
        <Button
          onClick={fetchSuggestions}
          disabled={!selectedDisaster || loading}
        >
          {loading ? "Reallocating…" : "Reallocate using AI agents"}
        </Button>
      </header>

      {/* Disaster selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Disaster</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedDisaster}
            onValueChange={setSelectedDisaster}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a disaster" />
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

      {/* Error message */}
      {error && (
        <p className="mb-6 text-red-500 font-medium">{error}</p>
      )}

      {/* Prompt to run allocation if none cached */}
      {!current && !loading && !error && (
        <p className="text-gray-500">
          Click “Reallocate using AI agents” to fetch task allocations.
        </p>
      )}

      {/* Display cached suggestions */}
      {current && (
        <>
          {/* Disaster summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Disaster Summary</CardTitle>
              <CardDescription>
                {current.disaster.disaster_summary}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Identified tasks */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Identified Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {current.tasks.map((t, i) => (
                  <li key={i}>
                    <strong>[{t.urgency.toUpperCase()}]</strong>{" "}
                    {t.description} — Needs {t.manpower_requirement} people; Resources:{" "}
                    {t.resource_requirements
                      .map((r) => `${r.quantity}× ${r.resource_type}`)
                      .join(", ")}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* AI-recommended allocations */}
          <Card>
            <CardHeader>
              <CardTitle>AI-Recommended Allocations</CardTitle>
            </CardHeader>
            <CardContent>
              {current.task_allocations.length === 0 && (
                <p className="text-gray-500">No allocations proposed.</p>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Donor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {current.task_allocations.map((ta, ti) =>
                    ta.resource_allocations.map((ra, ri) => (
                      <TableRow key={`${ti}-${ri}`}>
                        <TableCell className="whitespace-normal">
                          {ta.task.description}
                        </TableCell>
                        <TableCell>{ra.resource.resource_type}</TableCell>
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
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
