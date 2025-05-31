"use client"

import { useEffect, useState } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebaseClient"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface RequestsOverviewProps {
  disasterId?: string
}

export function RequestsOverview({ disasterId }: RequestsOverviewProps) {
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const baseRef = collection(db, "requests")
      const q = disasterId ? query(baseRef, where("disaster_id", "==", disasterId)) : baseRef
      const snapshot = await getDocs(q)

      const counts: Record<string, { new: number; inProgress: number; completed: number }> = {}

      snapshot.forEach((doc) => {
        const data = doc.data()

        const type = data.type_of_need || "Other"
        const status = (data.status || "open").toLowerCase()

        if (!counts[type]) {
          counts[type] = { new: 0, inProgress: 0, completed: 0 }
        }

        if (status === "open") counts[type].new++
        else if (status === "in_progress") counts[type].inProgress++
        else if (status === "completed") counts[type].completed++
      })

      //  Print grouped summary
      // console.log("Request Type Counts:", counts) 

      const labels = Object.keys(counts)

      setChartData({
        labels,
        datasets: [
          {
            label: "New",
            data: labels.map((label) => counts[label].new),
            backgroundColor: "rgba(59, 130, 246, 0.6)",
          },
          {
            label: "In Progress",
            data: labels.map((label) => counts[label].inProgress),
            backgroundColor: "rgba(245, 158, 11, 0.6)",
          },
          {
            label: "Completed",
            data: labels.map((label) => counts[label].completed),
            backgroundColor: "rgba(16, 185, 129, 0.6)",
          },
        ],
      })
    }

    fetchData()
  }, [disasterId])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      x: { stacked: false },
      y: { stacked: false, beginAtZero: true },
    },
  }

  return (
    <div className="h-80">
      {chartData ? <Bar data={chartData} options={options} /> : <p>Loading chart...</p>}
    </div>
  )
}
