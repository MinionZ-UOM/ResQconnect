"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, MapPin, Calendar, AlertTriangle } from "lucide-react"
import type { Disaster, DisasterType } from "@/lib/types"

export function DisasterList() {
  const [filter, setFilter] = useState<DisasterType | "All">("All")

  // Mock disaster data - in a real app, this would come from an API
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
    {
      id: "disaster-003",
      name: "Midwest Flooding",
      type: "Flood",
      status: "Active",
      description: "Severe flooding along the Mississippi River affecting multiple states.",
      location: { latitude: 38.627, longitude: -90.1994, address: "St. Louis, MO" },
      affectedArea: { radius: 75 },
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      severity: 3,
      impactedPopulation: 15000,
      createdBy: "admin-001",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      id: "disaster-004",
      name: "Seattle Earthquake",
      type: "Earthquake",
      status: "Active",
      description: "6.5 magnitude earthquake causing significant damage to infrastructure.",
      location: { latitude: 47.6062, longitude: -122.3321, address: "Seattle, WA" },
      affectedArea: { radius: 30 },
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      severity: 4,
      impactedPopulation: 35000,
      createdBy: "admin-001",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
    },
  ]

  const filteredDisasters = filter === "All" ? mockDisasters : mockDisasters.filter((d) => d.type === filter)

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
                  <span>Started: {disaster.startDate.toLocaleDateString()}</span>
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
