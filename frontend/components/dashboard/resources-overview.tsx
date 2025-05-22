"use client"

import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import type { ResourceType } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend)

interface ResourcesOverviewProps {
  role: string
}

export function ResourcesOverview({ role }: ResourcesOverviewProps) {
  // Mock data - in a real app, this would come from an API
  const resourceTypes: ResourceType[] = ["Vehicle", "Medical", "Food", "Shelter", "Equipment", "Personnel"]

  const data = {
    labels: resourceTypes,
    datasets: [
      {
        data: resourceTypes.map(() => Math.floor(Math.random() * 50) + 10),
        backgroundColor: [
          "rgba(59, 130, 246, 0.6)",
          "rgba(16, 185, 129, 0.6)",
          "rgba(245, 158, 11, 0.6)",
          "rgba(139, 92, 246, 0.6)",
          "rgba(239, 68, 68, 0.6)",
          "rgba(75, 85, 99, 0.6)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(75, 85, 99, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
    },
  }

  // Mock critical resources
  const criticalResources = [
    { name: "Ambulances", type: "Vehicle", available: 3, total: 10 },
    { name: "Medical Kits", type: "Medical", available: 15, total: 50 },
    { name: "Emergency Food", type: "Food", available: 120, total: 500 },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-80">
        <Doughnut data={data} options={options} />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Critical Resources</h3>
        <div className="space-y-4">
          {criticalResources.map((resource) => (
            <div key={resource.name} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{resource.name}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <Badge variant="outline">{resource.type}</Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {resource.available} / {resource.total}
                </div>
                <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1">
                  <div
                    className={`h-full rounded-full ${
                      (resource.available / resource.total) < 0.3
                        ? "bg-red-500"
                        : resource.available / resource.total < 0.6
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${(resource.available / resource.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
