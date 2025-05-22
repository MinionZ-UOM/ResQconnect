"use client"

import { useState } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import type { RequestType } from "@/lib/types"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface RequestsOverviewProps {
  role: string
}

export function RequestsOverview({ role }: RequestsOverviewProps) {
  // Mock data - in a real app, this would come from an API
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("day")

  const requestTypes: RequestType[] = ["Medical", "Food", "Shelter", "Evacuation", "Rescue", "Other"]

  // Generate random data based on request types
  const data = {
    labels: requestTypes,
    datasets: [
      {
        label: "New",
        data: requestTypes.map(() => Math.floor(Math.random() * 20) + 5),
        backgroundColor: "rgba(59, 130, 246, 0.6)",
      },
      {
        label: "In Progress",
        data: requestTypes.map(() => Math.floor(Math.random() * 15) + 3),
        backgroundColor: "rgba(245, 158, 11, 0.6)",
      },
      {
        label: "Completed",
        data: requestTypes.map(() => Math.floor(Math.random() * 10) + 2),
        backgroundColor: "rgba(16, 185, 129, 0.6)",
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        stacked: false,
        beginAtZero: true,
      },
    },
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
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
      </div>

      <div className="h-80">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}
