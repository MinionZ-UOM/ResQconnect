"use client"

import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import type { ResourceType } from "@/lib/types"

ChartJS.register(ArcElement, Tooltip, Legend)

interface ResourcesOverviewProps {
  role: string
}

export function ResourcesOverview({ role }: ResourcesOverviewProps) {
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

  return (
    <div className="h-80">
      <Doughnut data={data} options={options} />
    </div>
  )
}