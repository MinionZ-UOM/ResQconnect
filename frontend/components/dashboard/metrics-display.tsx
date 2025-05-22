"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface MetricsDisplayProps {
  role: string
}

export function MetricsDisplay({ role }: MetricsDisplayProps) {
  // Mock data - in a real app, this would come from an API
  const labels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"]

  const data = {
    labels,
    datasets: [
      {
        label: "Response Time (min)",
        data: labels.map(() => Math.floor(Math.random() * 30) + 10),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
      {
        label: "AI Accuracy (%)",
        data: labels.map(() => Math.floor(Math.random() * 20) + 75),
        borderColor: "rgba(139, 92, 246, 1)",
        backgroundColor: "rgba(139, 92, 246, 0.5)",
      },
      {
        label: "User Satisfaction (%)",
        data: labels.map(() => Math.floor(Math.random() * 15) + 80),
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.5)",
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
      y: {
        beginAtZero: false,
      },
    },
  }

  // AI performance metrics
  const aiMetrics = [
    { name: "Average Processing Time", value: "1.2s", change: "-15%" },
    { name: "Request Classification Accuracy", value: "92%", change: "+3%" },
    { name: "Priority Assignment Accuracy", value: "88%", change: "+5%" },
    { name: "Resource Allocation Efficiency", value: "78%", change: "+12%" },
  ]

  return (
    <div className="space-y-6">
      <div className="h-64">
        <Line data={data} options={options} />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">AI Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {aiMetrics.map((metric) => (
            <div key={metric.name} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <div className="text-sm text-slate-500 dark:text-slate-400">{metric.name}</div>
              <div className="text-xl font-semibold">{metric.value}</div>
              <div className={`text-sm ${metric.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                {metric.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
