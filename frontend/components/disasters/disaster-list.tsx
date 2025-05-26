"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, MapPin, Calendar, AlertTriangle } from "lucide-react"
import type { Disaster, DisasterType } from "@/lib/types"

export function DisasterList() {
  const [filter, setFilter] = useState<DisasterType | "All">("All")
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/disasters")
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`)
        const data: Disaster[] = await res.json()
        setDisasters(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p>Loading disasters…</p>
  if (error)   return <p className="text-red-600">Error: {error}</p>

  const filteredDisasters = filter === "All" ? disasters : disasters.filter((d) => d.type === filter)
  
  const disasterTypes: DisasterType[] = ["Flood", "Earthquake", "Wildfire", "Hurricane", "Tornado", "Other"]

  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <Button
          variant={filter === "All" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("All")}
          className="rounded-full"
        >
          All
        </Button>
        {disasterTypes.map((type) => (
          <Button
            key={type}
            variant={filter === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(type)}
            className="rounded-full"
          >
            {type}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDisasters.map((disaster) => (
          <Card key={disaster.id} className="overflow-hidden">
            <div
              className="h-48 bg-cover bg-center"
              style={{
                backgroundImage: `url('/placeholder.svg?height=300&width=600')`,
              }}
            >
              <div className="h-full w-full bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div>
                  <Badge
                    className={
                      disaster.severity >= 4
                        ? "bg-red-500"
                        : disaster.severity === 3
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                    }
                  >
                    Severity: {disaster.severity}/5
                  </Badge>
                  <h3 className="text-xl font-bold text-white mt-2">{disaster.name}</h3>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <AlertTriangle
                  className={`h-10 w-10 p-2 rounded-full flex-shrink-0 ${
                    disaster.type === "Wildfire"
                      ? "text-red-500 bg-red-100"
                      : disaster.type === "Hurricane"
                        ? "text-blue-500 bg-blue-100"
                        : disaster.type === "Flood"
                          ? "text-cyan-500 bg-cyan-100"
                          : "text-orange-500 bg-orange-100"
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{disaster.type}</Badge>
                    <Badge
                      variant={
                        disaster.status === "Active"
                          ? "destructive"
                          : disaster.status === "Contained"
                            ? "default"
                            : "outline"
                      }
                    >
                      {disaster.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{disaster.description}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{disaster.location.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {/*<span>Started: {disaster.startDate.toLocaleDateString()}</span>*/}
                  <span>Started: {disaster.startDate instanceof Date ? disaster.startDate.toLocaleDateString() : disaster.startDate}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
              <div className="text-sm">
                <span className="font-medium">{disaster.impactedPopulation?.toLocaleString()}</span> people affected
              </div>
              <Button asChild size="sm">
                <Link href={`/disaster/${disaster.id}`}>
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}